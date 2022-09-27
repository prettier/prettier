import path from "node:path";
import createEsmUtils from "esm-utils";
import esbuild from "esbuild";
import { NodeModulesPolyfillPlugin as esbuildPluginNodeModulePolyfills } from "@esbuild-plugins/node-modules-polyfill";
import browserslistToEsbuild from "browserslist-to-esbuild";
import { PROJECT_ROOT, DIST_DIR } from "../utils/index.mjs";
import esbuildPluginEvaluate from "./esbuild-plugins/evaluate.mjs";
import esbuildPluginReplaceModule from "./esbuild-plugins/replace-module.mjs";
import esbuildPluginLicense from "./esbuild-plugins/license.mjs";
import esbuildPluginUmd from "./esbuild-plugins/umd.mjs";
import esbuildPluginInteropDefault from "./esbuild-plugins/interop-default.mjs";
import esbuildPluginVisualizer from "./esbuild-plugins/visualizer.mjs";
import esbuildPluginStripNodeProtocol from "./esbuild-plugins/strip-node-protocol.mjs";
import esbuildPluginThrowWarnings from "./esbuild-plugins/throw-warnings.mjs";
import esbuildPluginShimCommonjsObjects from "./esbuild-plugins/shim-commonjs-objects.mjs";
import transform from "./transform/index.js";

const { dirname, readJsonSync, require } = createEsmUtils(import.meta);
const packageJson = readJsonSync("../../package.json");

const universalTarget = browserslistToEsbuild(packageJson.browserslist);

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
    // Transform `.at` and `Object.hasOwn`
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
      module: path.join(
        path.dirname(require.resolve("outdent/package.json")),
        "lib-module/index.js"
      ),
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
    Which requires `os` shim in universal bundles
    We already replaced line end to `\n` before calling it
    */
    {
      module: require.resolve("jest-docblock"),
      process: (text) =>
        text
          .replaceAll(
            "const line = (0, _detectNewline().default)(docblock) || _os().EOL;",
            'const line = "\\n"'
          )
          .replace(/\nfunction _os().*?\n}/s, "")
          .replace(/\nfunction _detectNewline().*?\n}/s, ""),
    },
  ];

  const define = {
    "process.env.PRETTIER_TARGET": JSON.stringify(file.platform),
    "process.env.NODE_ENV": JSON.stringify("production"),
  };

  if (file.platform === "universal") {
    // We can't reference `process` in UMD bundles and this is
    // an undocumented "feature"
    replaceModule.push({
      module: "*",
      find: "process.env.PRETTIER_DEBUG",
      replacement: "globalThis.PRETTIER_DEBUG",
    });

    define.process = JSON.stringify({ env: {}, argv: [] });

    // Replace `__dirname` and `__filename` with a fake value
    // So `parser-typescript.js` won't contain a path of working directory
    // See #8268
    define.__filename = JSON.stringify(
      "/prettier-security-filename-placeholder.js"
    );
    define.__dirname = JSON.stringify("/prettier-security-dirname-placeholder");
  }

  if (file.platform === "node") {
    // External other bundled files
    replaceModule.push(
      ...files
        .filter(
          (bundle) =>
            bundle.input === "package.json" ||
            (file.input !== bundle.input && bundle.output.format === "esm")
        )
        .map((bundle) => {
          let output = bundle.output.file;
          if (
            file.output.file === "index.cjs" &&
            bundle.output.file === "esm/doc.mjs"
          ) {
            output = "doc.js";
          }

          return {
            module: path.join(PROJECT_ROOT, bundle.input),
            external: `./${output}`,
          };
        })
    );
  } else {
    replaceModule.push(
      // When running build script with `--no-minify`, `esbuildPluginNodeModulePolyfills` shim `module` module incorrectly
      {
        module: "*",
        find: 'import { createRequire } from "node:module";',
        replacement: "",
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
      }
    );

    // Replace parser getters with `undefined`
    for (const file of [
      "src/language-css/parsers.js",
      "src/language-graphql/parsers.js",
      "src/language-html/parsers.js",
      "src/language-handlebars/parsers.js",
      "src/language-js/parse/parsers.js",
      "src/language-markdown/parsers.js",
      "src/language-yaml/parsers.js",
      // This module requires file access, should not include in universal bundle
      "src/utils/get-interpreter.js",
    ]) {
      replaceModule.push({
        module: path.join(PROJECT_ROOT, file),
        text: "export default undefined;",
      });
    }
  }

  const { buildOptions } = file;
  const shouldMinify =
    cliOptions.minify ?? buildOptions.minify ?? file.platform === "universal";

  const esbuildOptions = {
    entryPoints: [path.join(PROJECT_ROOT, file.input)],
    define,
    bundle: true,
    metafile: true,
    plugins: [
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
    ].filter(Boolean),
    minify: shouldMinify,
    legalComments: "none",
    external: ["pnpapi", ...(buildOptions.external ?? [])],
    // Disable esbuild auto discover `tsconfig.json` file
    tsconfig: path.join(dirname, "empty-tsconfig.json"),
    target: [...(buildOptions.target ?? ["node14"])],
    logLevel: "error",
    format: file.output.format,
    outfile: path.join(DIST_DIR, cliOptions.saveAs ?? file.output.file),
  };

  if (file.platform === "universal") {
    if (!buildOptions.target) {
      esbuildOptions.target.push(...universalTarget);
    }

    if (file.output.format === "umd") {
      esbuildOptions.plugins.push(
        esbuildPluginUmd({
          name: file.output.umdVariableName,
          interopDefault: buildOptions.interopDefault ?? true,
        })
      );
    }
  } else {
    esbuildOptions.platform = "node";
    esbuildOptions.external.push(...files.map((file) => file.output.file));

    if (file.output.format !== "esm" && buildOptions.interopDefault) {
      esbuildOptions.plugins.push(esbuildPluginInteropDefault());
    }

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
