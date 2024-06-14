import path from "node:path";

import browserslistToEsbuild from "browserslist-to-esbuild";
import esbuild from "esbuild";
import { nodeModulesPolyfillPlugin as esbuildPluginNodeModulePolyfills } from "esbuild-plugins-node-modules-polyfill";
import createEsmUtils from "esm-utils";

import { DIST_DIR, PROJECT_ROOT } from "../utils/index.js";
import esbuildPluginAddDefaultExport from "./esbuild-plugins/add-default-export.js";
import esbuildPluginEvaluate from "./esbuild-plugins/evaluate.js";
import esbuildPluginLicense from "./esbuild-plugins/license.js";
import esbuildPluginPrimitiveDefine from "./esbuild-plugins/primitive-define.js";
import esbuildPluginReplaceModule from "./esbuild-plugins/replace-module.js";
import esbuildPluginShimCommonjsObjects from "./esbuild-plugins/shim-commonjs-objects.js";
import esbuildPluginStripNodeProtocol from "./esbuild-plugins/strip-node-protocol.js";
import esbuildPluginThrowWarnings from "./esbuild-plugins/throw-warnings.js";
import esbuildPluginUmd from "./esbuild-plugins/umd.js";
import esbuildPluginVisualizer from "./esbuild-plugins/visualizer.js";
import transform from "./transform/index.js";
import { getPackageFile } from "./utils.js";

const { dirname, readJsonSync, require } = createEsmUtils(import.meta);
const packageJson = readJsonSync("../../package.json");

const universalTarget = browserslistToEsbuild(packageJson.browserslist);
const getRelativePath = (from, to) => {
  const relativePath = path.posix.relative(path.dirname(`/${from}`), `/${to}`);
  if (!relativePath.startsWith(".")) {
    return `./${relativePath}`;
  }

  return relativePath;
};

function getEsbuildOptions({ file, files, shouldCollectLicenses, cliOptions }) {
  // Save dependencies to file
  file.dependencies = [];

  const replaceModule = [
    // Use `require` directly
    {
      module: "*",
      find: "const require = createRequire(import.meta.url);",
      replacement: "",
    },
    // Use `__dirname` directly
    {
      module: "*",
      find: "const __dirname = path.dirname(fileURLToPath(import.meta.url));",
      replacement: "",
    },
    // Transform `.at`, `Object.hasOwn`, and `String#replaceAll`
    {
      module: "*",
      process: transform,
    },
    // #12493, not sure what the problem is, but replace the cjs version with esm version seems fix it
    {
      module: require.resolve("tslib"),
      path: require.resolve("tslib").replace(/tslib\.js$/, "tslib.es6.js"),
    },
    // https://github.com/evanw/esbuild/issues/2103
    {
      module: getPackageFile("outdent/lib-module/index.js"),
      process(text) {
        const index = text.indexOf('if (typeof module !== "undefined") {');
        if (index === -1) {
          throw new Error("Unexpected code");
        }
        return text.slice(0, index);
      },
    },
    /*
    `jest-docblock` try to detect new line in code, and it will fallback to `os.EOL`,
    We already replaced line end to `\n` before calling it
    */
    {
      module: require.resolve("jest-docblock"),
      process: (text) =>
        text
          .replace(
            "const line = (0, _detectNewline().default)(docblock) ?? _os().EOL;",
            String.raw`const line = "\n"`,
          )
          .replace(
            "const line = (0, _detectNewline().default)(comments) ?? _os().EOL;",
            String.raw`const line = "\n"`,
          )
          .replace(/\nfunction _os\(\).*?\n}/s, "")
          .replace(/\nfunction _detectNewline\(\).*?\n}/s, ""),
    },
  ];

  const define = {
    "process.env.PRETTIER_TARGET": file.platform,
    "process.env.NODE_ENV": "production",
  };

  if (file.platform === "universal") {
    // We can't reference `process` in UMD bundles and this is
    // an undocumented "feature"
    replaceModule.push({
      module: "*",
      find: "process.env.PRETTIER_DEBUG",
      replacement: "globalThis.PRETTIER_DEBUG",
    });

    define.process = undefined;
    // @babel/code-frame/lib/index.js
    define["process.emitWarning"] = undefined;
    // postcss/lib/postcss.js
    define["process.env.LANG"] = "";
    // @typescript-eslint/typescript-estree
    define["process.env.TYPESCRIPT_ESLINT_EXPERIMENTAL_TSSERVER"] = "";

    // Replace `__dirname` and `__filename` with a fake value
    // So `parser-typescript.js` won't contain a path of working directory
    // See #8268
    define.__filename = "/prettier-security-filename-placeholder.js";
    define.__dirname = "/prettier-security-dirname-placeholder";
  }

  if (file.platform === "node") {
    // External other bundled files
    replaceModule.push(
      ...files
        .filter(
          (bundle) =>
            bundle.input === "package.json" ||
            (file.input !== bundle.input && bundle.output.format === "esm"),
        )
        .map((bundle) => {
          let output = bundle.output.file;
          if (
            file.output.file === "index.cjs" &&
            bundle.output.file === "doc.mjs"
          ) {
            output = "doc.js";
          }

          return {
            module: path.join(PROJECT_ROOT, bundle.input),
            external: getRelativePath(file.output.file, output),
          };
        }),
    );
  } else {
    replaceModule.push(
      // When running build script with `--no-minify`, `esbuildPluginNodeModulePolyfills` shim `module` module incorrectly
      {
        module: "*",
        find: 'import { createRequire } from "node:module";',
        replacement: "",
      },
      // Prevent `esbuildPluginNodeModulePolyfills` shim `assert`, which will include a big `buffer` shim
      // TODO[@fisker]: Find a better way
      {
        module: "*",
        find: ' from "node:assert";',
        replacement: ` from ${JSON.stringify(
          path.join(dirname, "./shims/assert.js"),
        )};`,
      },
      // Prevent `esbuildPluginNodeModulePolyfills` include shim for this module
      {
        module: "assert",
        path: path.join(dirname, "./shims/assert.js"),
      },
      // `esbuildPluginNodeModulePolyfills` didn't shim this module
      {
        module: "module",
        text: "export const createRequire = () => {};",
      },
      // This module requires file access, should not include in universal bundle
      {
        module: path.join(PROJECT_ROOT, "src/utils/get-interpreter.js"),
        text: "export default undefined;",
      },
    );
  }

  const { buildOptions } = file;
  const shouldMinify =
    cliOptions.minify ?? buildOptions.minify ?? file.platform === "universal";

  const esbuildOptions = {
    entryPoints: [path.join(PROJECT_ROOT, file.input)],
    bundle: true,
    metafile: true,
    plugins: [
      esbuildPluginPrimitiveDefine(define),
      esbuildPluginEvaluate(),
      esbuildPluginStripNodeProtocol(),
      esbuildPluginReplaceModule({
        replacements: [...replaceModule, ...(buildOptions.replaceModule ?? [])],
      }),
      file.platform === "universal" && esbuildPluginNodeModulePolyfills(),
      shouldCollectLicenses &&
        esbuildPluginLicense({
          cwd: PROJECT_ROOT,
          thirdParty: {
            includePrivate: true,
            output: (dependencies) => file.dependencies.push(...dependencies),
          },
        }),
      cliOptions.reports &&
        esbuildPluginVisualizer({ formats: cliOptions.reports }),
      esbuildPluginThrowWarnings({
        allowDynamicRequire: file.platform === "node",
        allowDynamicImport: file.platform === "node",
      }),
      buildOptions.addDefaultExport && esbuildPluginAddDefaultExport(),
    ].filter(Boolean),
    minify: shouldMinify,
    legalComments: "none",
    external: ["pnpapi", ...(buildOptions.external ?? [])],
    // Disable esbuild auto discover `tsconfig.json` file
    tsconfigRaw: JSON.stringify({}),
    target: [...(buildOptions.target ?? ["node14"])],
    logLevel: "error",
    format: file.output.format,
    outfile: path.join(DIST_DIR, cliOptions.saveAs ?? file.output.file),
    // https://esbuild.github.io/api/#main-fields
    mainFields: file.platform === "node" ? ["module", "main"] : undefined,
  };

  if (file.platform === "universal") {
    if (!buildOptions.target) {
      esbuildOptions.target.push(...universalTarget);
    }

    if (file.output.format === "umd") {
      esbuildOptions.plugins.push(
        esbuildPluginUmd({
          name: file.output.umdVariableName,
        }),
      );
    }
  } else {
    esbuildOptions.platform = "node";
    esbuildOptions.external.push(...files.map((file) => file.output.file));

    // https://github.com/evanw/esbuild/issues/1921
    if (file.output.format === "esm") {
      esbuildOptions.plugins.push(esbuildPluginShimCommonjsObjects());
    }
  }

  return esbuildOptions;
}

async function runEsbuild(options) {
  const esbuildOptions = getEsbuildOptions(options);
  await esbuild.build(esbuildOptions);
}

export default runEsbuild;
