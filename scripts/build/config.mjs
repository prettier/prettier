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
 * @property {Object.<string, string | {code: string}>} replaceModule - module replacement path or code
 * @property {{file: string, find: string, replacement: string}[]} replaceText - Text replacements
 * @property {string[]} babelPlugins - babel plugins
 * @property {boolean?} minify - minify
 * @property {string[]?} esbuildTarget - ESBuild target
 * @property {boolean?} skipBabel - Skip babel transform

 * @typedef {Object} CommonJSConfig
 * @property {string[]} ignore - paths of CJS modules to ignore
 */

/*
`diff` use deprecated folder mapping "./" in the "exports" field,
so we can't `require("diff/lib/diff/array.js")` directly.
To reduce the bundle size, replace the entry with smaller files.

We can switch to deep require once https://github.com/kpdecker/jsdiff/pull/351 get merged
*/
const replaceDiffPackageEntry = (file) => ({
  [require.resolve("diff")]: path.join(
    path.dirname(require.resolve("diff/package.json")),
    file
  ),
});

/** @type {Bundle[]} */
const parsers = [
  {
    input: "src/language-js/parse/babel.js",
  },
  {
    input: "src/language-js/parse/flow.js",
    replaceText: [
      // `flow-parser` use this for `globalThis`, can't work in strictMode
      {
        file: require.resolve("flow-parser"),
        find: "(function(){return this}())",
        replacement: "(globalThis)",
      },
    ],
  },
  {
    input: "src/language-js/parse/typescript.js",
    replaceText: [
      // `@typescript-eslint/typescript-estree` v4
      {
        file: "*",
        find: 'require("globby")',
        replacement: "{}",
      },
      {
        file: "*",
        find: "extra.projects = prepareAndTransformProjects(",
        replacement: "extra.projects = [] || prepareAndTransformProjects(",
      },
      {
        file: "*",
        find: "process.versions.node",
        replacement: JSON.stringify("999.999.999"),
      },
      {
        file: "*",
        find: "process.cwd()",
        replacement: JSON.stringify("/prettier-security-dirname-placeholder"),
      },
      {
        file: "*",
        find: 'require("perf_hooks")',
        replacement: "{}",
      },
      {
        file: "*",
        find: 'require("inspector")',
        replacement: "{}",
      },
      {
        file: "*",
        find: "typescriptVersionIsAtLeast[version] = semverCheck(version);",
        replacement: "typescriptVersionIsAtLeast[version] = true;",
      },

      ...Object.entries({
        // `typescript/lib/typescript.js` expose extra global objects
        // `TypeScript`, `toolsVersion`, `globalThis`
        'typeof process === "undefined" || process.browser': "false",
        'typeof globalThis === "object"': "true",

        "_fs.realpathSync.native":
          "_fs.realpathSync && _fs.realpathSync.native",
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
        "var ClassifierShimObject = ":
          "var ClassifierShimObject = undefined && ",
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
      }).map(([find, replacement]) => ({
        file: require.resolve("typescript"),
        find,
        replacement,
      })),
    ],
    replaceModule: {
      [require.resolve("debug/src/browser.js")]:
        require.resolve("./shims/debug.cjs"),
    },
  },
  {
    input: "src/language-js/parse/acorn-and-espree.js",
    name: "prettierPlugins.espree",
    // TODO: Rename this file to `parser-acorn-and-espree.js` or find a better way
    output: "parser-espree.js",
    replaceText: [
      {
        file: require.resolve("espree"),
        find: "const Syntax = (function() {",
        replacement: "const Syntax = undefined && (function() {",
      },
      {
        file: require.resolve("espree"),
        find: "var visitorKeys = require('eslint-visitor-keys');",
        replacement: "var visitorKeys;",
      },
    ],
  },
  {
    input: "src/language-js/parse/meriyah.js",
  },
  {
    input: "src/language-js/parse/angular.js",
    replaceText: [
      {
        file: "*",
        find: 'require("@angular/compiler/src/',
        replacement: 'require("@angular/compiler/esm2015/src/',
      },
    ],
  },
  {
    input: "src/language-css/parser-postcss.js",
    replaceText: [
      {
        // `postcss-values-parser` uses constructor.name, it will be changed by bundler
        // https://github.com/shellscape/postcss-values-parser/blob/c00f858ab8c86ce9f06fdb702e8f26376f467248/lib/parser.js#L499
        file: require.resolve("postcss-values-parser/lib/parser.js"),
        find: "node.constructor.name === 'Word'",
        replacement: "node.type === 'word'",
      },
    ],
  },
  {
    input: "src/language-graphql/parser-graphql.js",
  },
  {
    input: "src/language-markdown/parser-markdown.js",
    replaceModule: {
      [require.resolve("parse-entities/decode-entity.browser.js")]:
        require.resolve("parse-entities/decode-entity.js"),
    },
  },
  {
    input: "src/language-handlebars/parser-glimmer.js",
  },
  {
    input: "src/language-html/parser-html.js",
  },
  {
    input: "src/language-yaml/parser-yaml.js",
    replaceModule: {
      // Use `tslib.es6.js`, so we can avoid `globalThis` shim
      [require.resolve("tslib")]: require
        .resolve("tslib")
        .replace(/tslib\.js$/, "tslib.es6.js"),
    },
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
    replaceText: [
      {
        file: require.resolve("@iarna/toml/lib/toml-parser.js"),
        find: "const utilInspect = eval(\"require('util').inspect\")",
        replacement: "const utilInspect = require('util').inspect",
      },
    ],
    replaceModule: replaceDiffPackageEntry("lib/diff/array.js"),
  },
  {
    input: "src/document/index.js",
    name: "doc",
    output: "doc.js",
    target: "universal",
    format: "umd",
    minify: false,
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
      ...replaceDiffPackageEntry("lib/diff/array.js"),
    },
  },
  {
    input: "bin/prettier.js",
    output: "bin-prettier.js",
    esbuildTarget: ["node0.10"],
    skipBabel: true,
  },
  {
    input: "src/cli/index.js",
    output: "cli.js",
    external: ["benchmark"],
    replaceModule: replaceDiffPackageEntry("lib/patch/create.js"),
  },
  {
    input: "src/common/third-party.js",
    replaceModule: {
      // cosmiconfig@6 -> import-fresh can't find parentModule, since module is bundled
      [require.resolve("parent-module")]: require.resolve(
        "./shims/parent-module.cjs"
      ),
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
