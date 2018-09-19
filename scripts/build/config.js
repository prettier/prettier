"use strict";

const path = require("path");

/**
 * @typedef {Object} Bundle
 * @property {string} input - input of the bundle
 * @property {string?} output - path of the output file in the `dist/` folder
 * @property {string?} name - name for the UMD bundle (for plugins, it'll be `prettierPlugins.${name}`)
 * @property {'node' | 'universal'} target - should generate a CJS only for node or UMD bundle
 * @property {'core' | 'plugin'} type - it's a plugin bundle or core part of prettier
 * @property {'rollup' | 'webpack'} [bundler='rollup'] - define which bundler to use
 * @property {CommonJSConfig} [commonjs={}] - options for `rollup-plugin-commonjs`
 * @property {string[]} external - array of paths that should not be included in the final bundle
 * @property {Object.<string, string>} replace - map of strings to replace when processing the bundle
 * @property {string[]} babelPlugins - babel plugins

 * @typedef {Object} CommonJSConfig
 * @property {Object} namedExports - for cases where rollup can't infer what's exported
 * @property {string[]} ignore - paths of CJS modules to ignore
 */

/** @type {Bundle[]} */
const parsers = [
  {
    input: "src/language-js/parser-babylon.js",
    target: "universal",
    babelPlugins: [
      require.resolve("./babel-plugins/replace-array-includes-with-indexof")
    ]
  },
  {
    input: "src/language-js/parser-flow.js",
    target: "universal",
    strict: false
  },
  {
    input: "src/language-js/parser-typescript.js",
    target: "universal"
  },
  {
    input: "src/language-css/parser-postcss.js",
    target: "universal",
    // postcss has dependency cycles that don't work with rollup
    bundler: "webpack"
  },
  {
    input: "src/language-graphql/parser-graphql.js",
    target: "universal"
  },
  {
    input: "src/language-markdown/parser-markdown.js",
    target: "universal"
  },
  {
    input: "src/language-vue/parser-vue.js",
    target: "universal"
  },
  {
    input: "src/language-handlebars/parser-glimmer.js",
    target: "universal",
    commonjs: {
      namedExports: {
        "node_modules/handlebars/lib/index.js": ["parse"],
        "node_modules/@glimmer/syntax/dist/modules/es2017/index.js": "default"
      },
      ignore: ["source-map"]
    }
  },
  {
    input: "src/language-html/parser-parse5.js",
    target: "universal"
  },
  {
    input: "src/language-yaml/parser-yaml.js",
    target: "universal",
    alias: {
      // Force using the CJS file, instead of ESM; i.e. get the file
      // from `"main"` instead of `"module"` (rollup default) of package.json
      "lines-and-columns": require.resolve("lines-and-columns")
    },
    babelPlugins: [
      require.resolve("./babel-plugins/replace-array-includes-with-indexof")
    ]
  }
].map(parser => {
  const name = getFileOutput(parser)
    .replace(/\.js$/, "")
    .split("-")[1];
  return Object.assign(parser, { type: "plugin", name });
});

/** @type {Bundle[]} */
const coreBundles = [
  {
    input: "index.js",
    type: "core",
    target: "node",
    external: [path.resolve("src/common/third-party.js")]
  },
  {
    input: "standalone.js",
    name: "prettier",
    type: "core",
    target: "universal"
  },
  {
    input: "bin/prettier.js",
    type: "core",
    output: "bin-prettier.js",
    target: "node",
    external: [path.resolve("src/common/third-party.js")]
  },
  {
    input: "src/common/third-party.js",
    type: "core",
    target: "node",
    replace: {
      // cosmiconfig@5 uses `require` to resolve js config, which caused Error:
      // Dynamic requires are not currently supported by rollup-plugin-commonjs.
      "require(filepath)": "eval('require')(filepath)"
    }
  }
];

function getFileOutput(bundle) {
  return bundle.output || path.basename(bundle.input);
}

module.exports = coreBundles
  .concat(parsers)
  .map(b => Object.assign(b, { output: getFileOutput(b) }));
