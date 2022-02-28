import path from "node:path";
import { createRequire } from "node:module";
import createEsmUtils from "esm-utils";

const { require } = createEsmUtils(import.meta);

/**
 * @typedef {Object} Bundle
 * @property {string} input - input of the bundle
 * @property {string?} output - path of the output file in the `dist/` folder
 * @property {string?} name - name for the UMD bundle (for plugins, it'll be `prettierPlugins.${name}`)
 * @property {'node' | 'universal'} target - should generate a CJS only for node or universal bundle
 * @property {'core' | 'plugin'} type - it's a plugin bundle or core part of prettier
 * @property {string[]} external - array of paths that should not be included in the final bundle
 * @property {Object.<string, string | {code?: string, file?: string | URL}>} replaceModule - module replacement path or code
 * @property {Object.<string, string>} replace - map of strings to replace when processing the bundle
 * @property {string[]} babelPlugins - babel plugins
 * @property {boolean?} minify - minify
 * @property {boolean?} isEsm - Entry is ES Module

 * @typedef {Object} CommonJSConfig
 * @property {string[]} ignore - paths of CJS modules to ignore
 */

/** @type {Bundle[]} */
const parsers = [
  {
    input: "src/language-js/parse/babel.js",
    isEsm: true,
  },
  {
    input: "src/language-js/parse/flow.js",
    replace: {
      // `flow-parser` use this for `globalThis`, can't work in strictMode
      "(function(){return this}())": '(new Function("return this")())',
    },
    isEsm: true,
  },
  {
    input: "src/language-js/parse/typescript.js",
    replace: {
      // `typescript/lib/typescript.js` expose extra global objects
      // `TypeScript`, `toolsVersion`, `globalThis`
      'typeof process === "undefined" || process.browser': "false",
      'typeof globalThis === "object"': "true",
      // `@typescript-eslint/typescript-estree` v4
      'require("globby")': "{}",
      "extra.projects = prepareAndTransformProjects(":
        "extra.projects = [] || prepareAndTransformProjects(",
      "process.versions.node": JSON.stringify("999.999.999"),
      "process.cwd()": JSON.stringify("/prettier-security-dirname-placeholder"),
      // `rollup-plugin-polyfill-node` don't have polyfill for these modules
      'require("perf_hooks")': "{}",
      'require("inspector")': "{}",
      "_fs.realpathSync.native": "_fs.realpathSync && _fs.realpathSync.native",
      // Remove useless `ts.sys`
      "ts.sys = ": "ts.sys = undefined && ",

      // Remove useless language service
      "ts.realizeDiagnostics = ": "ts.realizeDiagnostics = undefined && ",
      "ts.TypeScriptServicesFactory = ":
        "ts.TypeScriptServicesFactory = undefined && ",
      "var ShimBase = ": "var ShimBase = undefined && ",
      "var TypeScriptServicesFactory = ":
        "var TypeScriptServicesFactory = undefined && ",
      "var LanguageServiceShimObject = ":
        "var LanguageServiceShimObject = undefined && ",
      "var CoreServicesShimHostAdapter = ":
        "var CoreServicesShimHostAdapter = undefined && ",
      "var LanguageServiceShimHostAdapter = ":
        "var LanguageServiceShimHostAdapter = undefined && ",
      "var ScriptSnapshotShimAdapter = ":
        "var ScriptSnapshotShimAdapter = undefined && ",
      "var ClassifierShimObject = ": "var ClassifierShimObject = undefined && ",
      "var CoreServicesShimObject = ":
        "var CoreServicesShimObject = undefined && ",
      "function simpleForwardCall(": "0 && function simpleForwardCall(",
      "function forwardJSONCall(": "0 && function forwardJSONCall(",
      "function forwardCall(": "0 && function forwardCall(",
      "function realizeDiagnostics(": "0 && function realizeDiagnostics(",
      "function realizeDiagnostic(": "0 && function realizeDiagnostic(",
      "function convertClassifications(":
        "0 && function convertClassifications(",

      // Dynamic `require()`s
      "ts.sys && ts.sys.require": "false",
      "require(etwModulePath)": "undefined",
      'require("source-map-support").install()': "",
      "require(modulePath)": "undefined",
      // `node-semver` can't work with `@rollup/plugin-commonjs>=19.0.0`
      // https://github.com/rollup/plugins/issues/879
      // https://github.com/npm/node-semver/issues/381
      "typescriptVersionIsAtLeast[version] = semverCheck(version);":
        "typescriptVersionIsAtLeast[version] = true;",
    },
    replaceModule: {
      [require.resolve("debug")]: require.resolve("./shims/debug.cjs"),
    },
    isEsm: true,
  },
  {
    input: "src/language-js/parse/acorn-and-espree.js",
    name: "prettierPlugins.espree",
    // TODO: Rename this file to `parser-acorn-and-espree.js` or find a better way
    output: "parser-espree.js",
    replace: {
      "const Syntax = ": "const Syntax = undefined && ",
      "var visitorKeys = ": "var visitorKeys = undefined && ",
    },
    isEsm: true,
  },
  {
    input: "src/language-js/parse/meriyah.js",
    isEsm: true,
  },
  {
    input: "src/language-js/parse/angular.js",
    replace: {
      "@angular/compiler/src": "@angular/compiler/esm2015/src",
    },
    isEsm: true,
  },
  {
    input: "src/language-css/parser-postcss.js",
    replace: {
      // `postcss-values-parser` uses constructor.name, it will be changed by rollup or terser
      // https://github.com/shellscape/postcss-values-parser/blob/c00f858ab8c86ce9f06fdb702e8f26376f467248/lib/parser.js#L499
      "node.constructor.name === 'Word'": "node.type === 'word'",
    },
    isEsm: true,
  },
  {
    input: "src/language-graphql/parser-graphql.js",
    isEsm: true,
  },
  {
    input: "src/language-markdown/parser-markdown.js",
    replaceModule: {
      [require.resolve("parse-entities/decode-entity.browser.js")]:
        require.resolve("parse-entities/decode-entity.js"),
      // Avoid `node:util` shim
      [require.resolve("inherits")]: require.resolve(
        "inherits/inherits_browser.js"
      ),
    },
    isEsm: true,
  },
  {
    input: "src/language-handlebars/parser-glimmer.js",
    isEsm: true,
  },
  {
    input: "src/language-html/parser-html.js",
    isEsm: true,
  },
  {
    input: "src/language-yaml/parser-yaml.js",
    replaceModule: {
      // Use `tslib.es6.js`, so we can avoid `globalThis` shim
      [require.resolve("tslib")]: require
        .resolve("tslib")
        .replace(/tslib\.js$/, "tslib.es6.js"),
    },
    isEsm: true,
  },
].map((bundle) => {
  const { name } = bundle.input.match(
    /(?:parser-|parse\/)(?<name>.*?)\.js$/
  ).groups;

  return {
    type: "plugin",
    target: "universal",
    name: `prettierPlugins.${name}`,
    output: `parser-${name}.js`,
    ...bundle,
  };
});

/** @type {Bundle[]} */
const coreBundles = [
  {
    input: "src/index.js",
    replace: {
      // from @iarna/toml/parse-string
      "eval(\"require('util').inspect\")": "require('util').inspect",
    },
    isEsm: true,
  },
  {
    input: "src/document/index.js",
    name: "doc",
    output: "doc.js",
    target: "universal",
    format: "umd",
    minify: false,
    isEsm: true,
  },
  {
    input: "src/standalone.js",
    name: "prettier",
    target: "universal",
    replaceModule: {
      [require.resolve("@babel/highlight")]: require.resolve(
        "./shims/babel-highlight.cjs"
      ),
      [createRequire(require.resolve("vnopts")).resolve("chalk")]:
        require.resolve("./shims/chalk.cjs"),
    },
    isEsm: true,
  },
  {
    input: "bin/prettier.js",
    output: "bin-prettier.js",
    external: ["benchmark"],
  },
  {
    input: "src/common/third-party.cjs",
    output: "third-party.js",
    replace: {
      // cosmiconfig@6 -> import-fresh can't find parentModule, since module is bundled
      "parentModule(__filename)": "__filename",
    },
  },
].map((bundle) => ({
  type: "core",
  target: "node",
  output: path.basename(bundle.input),
  ...bundle,
}));

const configs = [...coreBundles, ...parsers];
export default configs;
