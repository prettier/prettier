import path from "node:path";
import camelCase from "camelcase";
import createEsmUtils from "esm-utils";
import builtinModules from "builtin-modules";
import esbuild from "esbuild";
import { NodeModulesPolyfillPlugin as esbuildPluginNodeModulePolyfills } from "@esbuild-plugins/node-modules-polyfill";
import { NodeGlobalsPolyfillPlugin as esbuildPluginNodeGlobalsPolyfills } from "@esbuild-plugins/node-globals-polyfill";
import esbuildPluginTextReplace from "esbuild-plugin-text-replace";
import browserslist from "browserslist";
import { resolveToEsbuildTarget } from "esbuild-plugin-browserslist";
import { PROJECT_ROOT, DIST_DIR } from "../utils/index.mjs";
import esbuildPluginEvaluate from "./esbuild-plugins/evaluate.mjs";
import esbuildPluginReplaceModule from "./esbuild-plugins/replace-module.mjs";
import esbuildPluginLicense from "./esbuild-plugins/license.mjs";
import bundles from "./config.mjs";

const { json, __dirname } = createEsmUtils(import.meta);
const packageJson = json.loadSync("../../package.json");

function* getEsbuildOptions(bundle, options) {
  const replaceStrings = {
    "process.env.PRETTIER_TARGET": JSON.stringify(bundle.target),
    "process.env.NODE_ENV": JSON.stringify("production"),
    // `tslib` exports global variables
    "createExporter(root": "createExporter({}",
  };
  if (bundle.target === "universal") {
    // We can't reference `process` in UMD bundles and this is
    // an undocumented "feature"
    replaceStrings["process.env.PRETTIER_DEBUG"] = "global.PRETTIER_DEBUG";
    // `rollup-plugin-node-globals` replace `__dirname` with the real dirname
    // `parser-typescript.js` will contain a path of working directory
    // See #8268
    replaceStrings.__filename = JSON.stringify(
      "/prettier-security-filename-placeholder.js"
    );
    replaceStrings.__dirname = JSON.stringify(
      "/prettier-security-dirname-placeholder"
    );
  }
  Object.assign(replaceStrings, bundle.replace);

  let shouldMinify = options.minify;
  if (typeof shouldMinify !== "boolean") {
    shouldMinify = bundle.minify !== false && bundle.target === "universal";
  }

  const replaceModule = {};
  // Replace other bundled files
  if (bundle.target === "node") {
    // Replace package.json with dynamic `require("./package.json")`
    replaceModule[path.join(PROJECT_ROOT, "package.json")] = "./package.json";

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
      code: `module.exports = ${JSON.stringify({
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
      replaceModule[path.join(PROJECT_ROOT, file)] = {
        code: "export default undefined;",
      };
    }
  }

  Object.assign(replaceModule, bundle.replaceModule);

  const esbuildOptions = {
    entryPoints: [path.join(PROJECT_ROOT, bundle.input)],
    bundle: true,
    metafile: true,
    plugins: [
      bundle.target === "universal" && esbuildPluginNodeGlobalsPolyfills(),
      bundle.target === "universal" && esbuildPluginNodeModulePolyfills(),
      esbuildPluginEvaluate(),
      esbuildPluginReplaceModule(replaceModule),
      esbuildPluginTextReplace({
        include: /\.js$/,
        // TODO[@fisker]: Use RegExp when possible
        pattern: Object.entries(replaceStrings),
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
    target: bundle.target === "node" ? ["node12"] : umdTarget,
    mainFields: ["main"],
  };

  if (bundle.target === "universal") {
    esbuildOptions.target = umdTarget;

    yield getEsbuildUmdOptions({
      ...esbuildOptions,
      globalName: bundle.name,
      outfile: path.join(DIST_DIR, bundle.output),
    });

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
    yield {
      ...esbuildOptions,
      outfile: path.join(DIST_DIR, bundle.output),
      format: "cjs",
      external: [
        ...esbuildOptions.external,
        ...builtinModules,
        "./package.json*",
        ...bundles
          .filter((item) => item.input !== bundle.input)
          .map((item) => `./${item.output}*`),
      ],
      target: ["node12"],
    };
  }
}

function getUmdWrapper(name) {
  const path = name.split(".");
  const temporaryName = camelCase(name);
  const placeholder = "/*! bundled code !*/";

  let globalObjectText = [];
  for (let index = 0; index < path.length; index++) {
    const object = ["root", ...path.slice(0, index + 1)].join(".");
    if (index === path.length - 1) {
      globalObjectText.push(`${object} = factory();`);
    } else {
      globalObjectText.push(`${object} = ${object} || {};`);
    }
  }
  globalObjectText = globalObjectText.map((text) => `    ${text}`).join("\n");

  let wrapper = `
    (function (factory) {
      if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
      } else if (typeof define === 'function' && define.amd) {
        define(factory);
      } else {
        var root = typeof globalThis !== 'undefined' ? globalThis : global || self;
        ${globalObjectText}
      }
    })(function() {
      ${placeholder}
      return ${temporaryName};
    });
  `;

  wrapper = esbuild
    .buildSync({
      stdin: { contents: wrapper },
      minify: true,
      write: false,
    })
    .outputFiles[0].text.trim();

  const [intro, outro] = wrapper.split(placeholder);

  return { name: temporaryName, intro, outro };
}

function getEsbuildUmdOptions(options) {
  const umdWrapper = getUmdWrapper(options.globalName);
  options.banner = options.banner || {};
  options.footer = options.footer || {};
  options.banner.js = umdWrapper.intro;
  options.footer.js = umdWrapper.outro;
  options.globalName = umdWrapper.name;
  return options;
}

const umdTarget = [
  "node12",
  ...resolveToEsbuildTarget(browserslist(packageJson.browserslist), {
    printUnknownTargets: false,
  }),
];

async function createBundle(bundle, cache, options) {
  if (
    options.playground &&
    (bundle.target !== "universal" || bundle.output === "doc.js")
  ) {
    return { skipped: true };
  }

  // TODO[@fisker]: Fix cache
  // if (
  //   cache &&
  //   (
  //     await Promise.all(
  //       outputOptions.map((outputOption) =>
  //         cache.isCached(inputOptions, outputOption)
  //       )
  //     )
  //   ).every((cached) => cached)
  // ) {
  //   return { cached: true };
  // }

  const esbuildOptions = getEsbuildOptions(bundle, options);
  for (const options of esbuildOptions) {
    await esbuild.build(options);
  }

  return { bundled: true };
}

export default createBundle;
