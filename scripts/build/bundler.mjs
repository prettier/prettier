import fs from "node:fs/promises";
import path from "node:path";
import createEsmUtils from "esm-utils";
import builtinModules from "builtin-modules";
import browserslist from "browserslist";
import * as babel from "@babel/core";
import esbuild from "esbuild";
import { NodeModulesPolyfillPlugin as esbuildPluginNodeModulePolyfills } from "@esbuild-plugins/node-modules-polyfill";
import esbuildPluginTextReplace from "esbuild-plugin-text-replace";
import { resolveToEsbuildTarget } from "esbuild-plugin-browserslist";
import { PROJECT_ROOT, DIST_DIR } from "../utils/index.mjs";
import esbuildPluginEvaluate from "./esbuild-plugins/evaluate.mjs";
import esbuildPluginReplaceModule from "./esbuild-plugins/replace-module.mjs";
import esbuildPluginLicense from "./esbuild-plugins/license.mjs";
import esbuildPluginUmd from "./esbuild-plugins/umd.mjs";
import bundles from "./config.mjs";

const { __dirname, json } = createEsmUtils(import.meta);
const packageJson = json.loadSync("../../package.json");

const umdTarget = resolveToEsbuildTarget(
  browserslist(packageJson.browserslist),
  { printUnknownTargets: false }
);

function getBabelConfig(bundle) {
  const config = {
    babelrc: false,
    assumptions: {
      setSpreadProperties: true,
    },
    sourceType: "unambiguous",
    plugins: bundle.babelPlugins || [],
    compact: false,
    exclude: [/\/core-js\//],
  };
  const targets = { node: "10" };
  if (bundle.target === "universal") {
    targets.browsers = packageJson.browserslist;
  }
  config.presets = [
    [
      "@babel/preset-env",
      {
        targets,
        exclude: [
          "es.array.unscopables.flat",
          "es.array.unscopables.flat-map",
          "es.array.sort",
          "es.promise",
          "es.promise.finally",
          "es.string.replace",
          "es.symbol.description",
          "es.typed-array.*",
          "web.*",
        ],
        modules: false,
        useBuiltIns: "usage",
        corejs: {
          version: 3,
        },
        debug: false,
      },
    ],
  ];
  config.plugins.push([
    "@babel/plugin-proposal-object-rest-spread",
    { useBuiltIns: true },
  ]);
  return config;
}

async function* getEsbuildOptions(bundle, options) {
  const replaceStrings = {
    // `tslib` exports global variables
    "createExporter(root": "createExporter({}",
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

  const replaceModule = {};
  // Replace other bundled files
  if (bundle.target === "node") {
    // Replace package.json with dynamic `require("./package.json")`
    replaceModule[path.join(PROJECT_ROOT, "package.json")] = {
      path: "./package.json",
      external: true,
    };

    // Dynamic require bundled files
    for (const item of bundles) {
      if (item.input !== bundle.input) {
        replaceModule[path.join(PROJECT_ROOT, item.input)] = `./${item.output}`;
      }
    }
  } else {
    // Universal bundle only use version info from package.json
    // Replace package.json with `{version: "{VERSION}"}`
    replaceModule[path.join(PROJECT_ROOT, "package.json")] = {
      contents: `module.exports = ${JSON.stringify({
        version: packageJson.version,
      })};`,
    };

    // Replace parser getters with `undefined`
    for (const file of [
      "src/language-css/parsers.js",
      "src/language-graphql/parsers.js",
      "src/language-handlebars/parsers.js",
      "src/language-html/parsers.js",
      "src/language-js/parse/parsers.js",
      "src/language-markdown/parsers.js",
      "src/language-yaml/parsers.js",
    ]) {
      replaceModule[path.join(PROJECT_ROOT, file)] = { contents: "" };
    }

    // Prevent `esbuildPluginNodeModulePolyfills` include shim for this module
    replaceModule.assert = {
      contents: await fs.readFile(path.join(__dirname, "./shims/assert.cjs")),
    };
  }

  let shouldMinify = options.minify;
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
      esbuildPluginReplaceModule({ ...replaceModule, ...bundle.replaceModule }),
      bundle.target === "universal" && esbuildPluginNodeModulePolyfills(),
      esbuildPluginTextReplace({
        include: /\.[cm]?js$/,
        // TODO[@fisker]: Use RegExp when possible
        pattern: Object.entries({ ...replaceStrings, ...bundle.replace }),
      }),
      options.onLicenseFound &&
        esbuildPluginLicense({
          cwd: PROJECT_ROOT,
          thirdParty: {
            includePrivate: true,
            output: options.onLicenseFound,
          },
        }),
    ].filter(Boolean),
    minify: shouldMinify,
    legalComments: "none",
    external: [...(bundle.external || [])],
    // Disable esbuild auto discover `tsconfig.json` file
    tsconfig: path.join(__dirname, "empty-tsconfig.json"),
    mainFields: ["main"],
    target: ["node10"],
    logLevel: "error",
  };

  if (bundle.target === "universal") {
    esbuildOptions.target.push(...umdTarget);

    yield {
      ...esbuildOptions,
      outfile: path.join(DIST_DIR, bundle.output),
      plugins: [
        esbuildPluginUmd({ name: bundle.name }),
        ...esbuildOptions.plugins,
      ],
      format: "umd",
    };

    if (!bundle.format && !options.playground) {
      yield {
        ...esbuildOptions,
        outfile: path.join(
          DIST_DIR,
          `esm/${bundle.output.replace(".js", ".mjs")}`
        ),
        format: "esm",
      };
    }
  } else {
    esbuildOptions.external.push(
      ...builtinModules,
      ...bundles
        .filter((item) => item.input !== bundle.input)
        .map((item) => `./${item.output}`)
    );

    yield {
      ...esbuildOptions,
      outfile: path.join(DIST_DIR, bundle.output),
      format: "cjs",
    };
  }
}

async function runBuild(bundle, esbuildOptions) {
  const { format, plugins, outfile } = esbuildOptions;

  await esbuild.build({
    ...esbuildOptions,
    plugins: plugins.filter(({ name }) => name !== "umd"),
    format: format === "umd" ? "cjs" : format,
    minify: false,
  });

  const text = await fs.readFile(outfile);

  const { code } = await babel.transformAsync(text, {
    filename: outfile,
    ...getBabelConfig(bundle),
  });
  await fs.writeFile(outfile, code);

  await esbuild.build({
    ...esbuildOptions,
    plugins: plugins.filter(({ name }) => name === "umd"),
    entryPoints: [outfile],
    allowOverwrite: true,
  });
}

async function createBundle(bundle, options) {
  if (
    options.playground &&
    (bundle.target !== "universal" || bundle.output === "doc.js")
  ) {
    return { skipped: true };
  }

  const esbuildOptions = getEsbuildOptions(bundle, options);
  for await (const options of esbuildOptions) {
    await runBuild(bundle, options);
  }

  return { bundled: true };
}

export default createBundle;
