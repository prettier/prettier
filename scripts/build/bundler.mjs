import path from "node:path";
import createEsmUtils from "esm-utils";
import esbuild from "esbuild";
import { NodeModulesPolyfillPlugin as esbuildPluginNodeModulePolyfills } from "@esbuild-plugins/node-modules-polyfill";
import esbuildPluginTextReplace from "esbuild-plugin-text-replace";
import browserslistToEsbuild from "browserslist-to-esbuild";
import { PROJECT_ROOT, DIST_DIR } from "../utils/index.mjs";
import esbuildPluginEvaluate from "./esbuild-plugins/evaluate.mjs";
import esbuildPluginReplaceModule from "./esbuild-plugins/replace-module.mjs";
import esbuildPluginLicense from "./esbuild-plugins/license.mjs";
import esbuildPluginUmd from "./esbuild-plugins/umd.mjs";
import esbuildPluginInteropDefault from "./esbuild-plugins/interop-default.mjs";
import esbuildPluginVisualizer from "./esbuild-plugins/visualizer.mjs";
import esbuildPluginStripNodeProtocol from "./esbuild-plugins/strip-node-protocol.mjs";
import bundles from "./config.mjs";

const { __dirname, readJsonSync, require } = createEsmUtils(import.meta);
const packageJson = readJsonSync("../../package.json");

const umdTarget = browserslistToEsbuild(packageJson.browserslist);
const EMPTY_MODULE_REPLACEMENT = { contents: "" };
const EXPORT_UNDEFINED_MODULE_REPLACEMENT = {
  contents: "export default undefined",
};

function* getEsbuildOptions(bundle, buildOptions) {
  const replaceStrings = {
    // `tslib` exports global variables
    "createExporter(root": "createExporter({}",

    // Use `require` directly
    "const require = createRequire(import.meta.url);": "",
  };

  const define = {
    "process.env.PRETTIER_TARGET": JSON.stringify(bundle.target),
    "process.env.NODE_ENV": JSON.stringify("production"),
  };

  if (bundle.target === "universal") {
    // We can't reference `process` in UMD bundles and this is
    // an undocumented "feature"
    replaceStrings["process.env.PRETTIER_DEBUG"] = "globalThis.PRETTIER_DEBUG";

    define.process = JSON.stringify({ env: {}, argv: [] });

    // Replace `__dirname` and `__filename` with a fake value
    // So `parser-typescript.js` won't contain a path of working directory
    // See #8268
    define.__filename = JSON.stringify(
      "/prettier-security-filename-placeholder.js"
    );
    define.__dirname = JSON.stringify("/prettier-security-dirname-placeholder");
  }

  const replaceModule = { module: EMPTY_MODULE_REPLACEMENT };
  // Replace other bundled files
  if (bundle.target === "node") {
    // TODO[@fisker]: Fix this later, currently esbuild resolve it as ESM
    // // Replace package.json with dynamic `require("./package.json")`
    // replaceModule[path.join(PROJECT_ROOT, "package.json")] = {
    //   path: "./package.json",
    //   external: true,
    // };
    replaceModule[path.join(PROJECT_ROOT, "package.json")] = {
      contents: JSON.stringify({ version: packageJson.version }),
      loader: "json",
    };

    // Dynamic require bundled files
    for (const item of bundles) {
      if (item.input !== bundle.input) {
        replaceModule[path.join(PROJECT_ROOT, item.input)] = {
          path: `./${item.output}`,
          isEsm: item.isEsm,
          external: true,
        };
      }
    }

    // Use `__dirname` directly
    replaceStrings[
      "const __dirname = path.dirname(fileURLToPath(import.meta.url));"
    ] = "";
  } else {
    // Universal bundle only use version info from package.json
    // Replace package.json with `{version: "{VERSION}"}`
    replaceModule[path.join(PROJECT_ROOT, "package.json")] = {
      contents: JSON.stringify({ version: packageJson.version }),
      loader: "json",
    };

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
      replaceModule[path.join(PROJECT_ROOT, file)] =
        EXPORT_UNDEFINED_MODULE_REPLACEMENT;
    }

    // Prevent `esbuildPluginNodeModulePolyfills` include shim for this module
    replaceModule.assert = require.resolve("./shims/assert.cjs");
  }

  let shouldMinify = buildOptions.minify;
  if (typeof shouldMinify !== "boolean") {
    shouldMinify = bundle.minify !== false && bundle.target === "universal";
  }

  const esbuildOptions = {
    entryPoints: [path.join(PROJECT_ROOT, bundle.input)],
    define,
    bundle: true,
    metafile: true,
    plugins: [
      esbuildPluginEvaluate(),
      esbuildPluginStripNodeProtocol(),
      esbuildPluginReplaceModule({ ...replaceModule, ...bundle.replaceModule }),
      bundle.target === "universal" && esbuildPluginNodeModulePolyfills(),
      esbuildPluginTextReplace({
        include: /\.[cm]?js$/,
        // TODO[@fisker]: Use RegExp when possible
        pattern: Object.entries({ ...replaceStrings, ...bundle.replace }),
      }),
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
    ].filter(Boolean),
    minify: shouldMinify,
    legalComments: "none",
    external: [...(bundle.external || [])],
    // Disable esbuild auto discover `tsconfig.json` file
    tsconfig: path.join(__dirname, "empty-tsconfig.json"),
    mainFields: ["module", "main"],
    target: ["node12"],
    logLevel: "error",
  };

  if (bundle.target === "universal") {
    esbuildOptions.target.push(...umdTarget);

    yield {
      ...esbuildOptions,
      outfile: bundle.output,
      plugins: [
        esbuildPluginUmd({
          name: bundle.name,
          interopDefault: Boolean(bundle.isEsm),
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
    esbuildOptions.external.push(
      ...bundles
        .filter((item) => item.input !== bundle.input)
        .map((item) => `./${item.output}`)
    );

    if (bundle.isEsm) {
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
