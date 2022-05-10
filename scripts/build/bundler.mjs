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
import bundles from "./config.mjs";

const { dirname, readJsonSync, require } = createEsmUtils(import.meta);
const packageJson = readJsonSync("../../package.json");

const umdTarget = browserslistToEsbuild(packageJson.browserslist);

const bundledFiles = [
  ...bundles,
  { input: "package.json", output: "package.json" },
].map(({ input, output }) => ({
  input: path.join(PROJECT_ROOT, input),
  output: `./${output}`,
}));

function* getEsbuildOptions(bundle, buildOptions) {
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
  ];

  const define = {
    "process.env.PRETTIER_TARGET": JSON.stringify(bundle.target),
    "process.env.NODE_ENV": JSON.stringify("production"),
  };

  if (bundle.target === "universal") {
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

  // Replace other bundled files
  if (bundle.target === "node") {
    // Replace bundled files and `package.json` with dynamic `require()`
    for (const { input, output } of bundledFiles) {
      replaceModule.push({ module: input, external: output });
    }

    // Transform import declaration into inline `require()`
    for (const file of [
      "src/language-css/parsers.js",
      "src/language-graphql/parsers.js",
      "src/language-html/parsers.js",
      "src/language-handlebars/parsers.js",
      "src/language-js/parse/parsers.js",
      "src/language-markdown/parsers.js",
      "src/language-yaml/parsers.js",
    ]) {
      replaceModule.push({
        module: path.join(PROJECT_ROOT, file),
        process(text) {
          const importDeclarations = text.matchAll(
            /(?<declaration>import (?<variableName>[A-Za-z]+) from "(?<source>\..*)";)/g
          );

          for (const {
            groups: { declaration, variableName, source },
          } of importDeclarations) {
            text = text.replace(declaration, "");
            text = text.replaceAll(
              `return ${variableName}.parsers`,
              `return require("${source}").parsers`
            );
          }

          return text;
        },
      });
    }
  } else {
    replaceModule.push(
      // Universal bundle only use version info from package.json
      // Replace package.json with `{version: "{VERSION}"}`
      {
        module: path.join(PROJECT_ROOT, "package.json"),
        text: JSON.stringify({ version: packageJson.version }),
        loader: "json",
      },
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

  let shouldMinify = buildOptions.minify;
  if (typeof shouldMinify !== "boolean") {
    shouldMinify = bundle.minify !== false && bundle.target === "universal";
  }

  const interopDefault =
    !bundle.input.endsWith(".cjs") && bundle.interopDefault !== false;

  const esbuildOptions = {
    entryPoints: [path.join(PROJECT_ROOT, bundle.input)],
    define,
    bundle: true,
    metafile: true,
    plugins: [
      esbuildPluginEvaluate(),
      esbuildPluginStripNodeProtocol(),
      esbuildPluginReplaceModule({
        replacements: [...replaceModule, ...(bundle.replaceModule ?? [])],
      }),
      bundle.target === "universal" && esbuildPluginNodeModulePolyfills(),
      buildOptions.onLicenseFound &&
        esbuildPluginLicense({
          cwd: PROJECT_ROOT,
          thirdParty: {
            includePrivate: true,
            output: buildOptions.onLicenseFound,
          },
        }),
      buildOptions.reports &&
        esbuildPluginVisualizer({ formats: buildOptions.reports }),
      esbuildPluginThrowWarnings(),
    ].filter(Boolean),
    minify: shouldMinify,
    legalComments: "none",
    external: ["pnpapi", ...(bundle.external ?? [])],
    // Disable esbuild auto discover `tsconfig.json` file
    tsconfig: path.join(dirname, "empty-tsconfig.json"),
    target: [...(bundle.esbuildTarget ?? ["node12"])],
    logLevel: "error",
  };

  if (bundle.target === "universal") {
    if (!bundle.esbuildTarget) {
      esbuildOptions.target.push(...umdTarget);
    }

    yield {
      ...esbuildOptions,
      outfile: bundle.output,
      plugins: [
        esbuildPluginUmd({
          name: bundle.name,
          interopDefault,
        }),
        ...esbuildOptions.plugins,
      ],
      format: "umd",
    };

    if (/^(?:standalone|parser-.*)\.js$/.test(bundle.output)) {
      yield {
        ...esbuildOptions,
        outfile: `esm/${bundle.output.replace(".js", ".mjs")}`,
        format: "esm",
      };
    }
  } else {
    esbuildOptions.platform = "node";
    esbuildOptions.external.push(...bundledFiles.map(({ output }) => output));

    if (interopDefault) {
      esbuildOptions.plugins.push(esbuildPluginInteropDefault());
    }

    yield {
      ...esbuildOptions,
      outfile: bundle.output,
      format: "cjs",
    };
  }
}

async function runBuild(bundle, esbuildOptions) {
  await esbuild.build(esbuildOptions);
}

async function* createBundle(bundle, buildOptions) {
  for (const esbuildOptions of getEsbuildOptions(bundle, buildOptions)) {
    const { outfile: file } = esbuildOptions;

    if (
      (buildOptions.files && !buildOptions.files.has(file)) ||
      (buildOptions.playground && esbuildOptions.format !== "umd")
    ) {
      yield { name: file, skipped: true };
      continue;
    }

    const relativePath = buildOptions.saveAs || file;
    const absolutePath = path.join(DIST_DIR, relativePath);

    esbuildOptions.outfile = absolutePath;

    yield { name: file, started: true };
    await runBuild(bundle, esbuildOptions, buildOptions);
    yield { name: file, relativePath, absolutePath };
  }
}

export default createBundle;
