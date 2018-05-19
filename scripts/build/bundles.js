"use strict";

const path = require("path");

const parsers = [
  {
    input: "src/language-js/parser-babylon.js",
    target: "universal",
    minify: true
  },
  {
    input: "src/language-js/parser-flow.js",
    target: "universal",
    minify: true,
    strict: false
  },
  {
    input: "src/language-js/parser-typescript.js",
    target: "universal",
    minify: true
  },
  {
    input: "src/language-css/parser-postcss.js",
    target: "universal",
    bundler: "webpack",
    minify: true
  },
  {
    input: "src/language-graphql/parser-graphql.js",
    target: "universal",
    minify: true
  },
  {
    input: "src/language-markdown/parser-markdown.js",
    target: "universal",
    minify: true
  },
  {
    input: "src/language-vue/parser-vue.js",
    target: "universal",
    minify: true
  },
  {
    input: "src/language-handlebars/parser-glimmer.js",
    target: "node",
    commonjs: {
      namedExports: {
        "node_modules/handlebars/lib/index.js": ["parse"],
        "node_modules/@glimmer/syntax/dist/modules/es2017/index.js": "default"
      },
      ignore: ["source-map"]
    },
    transpile: true,
    minify: true
  },
  {
    input: "src/language-html/parser-parse5.js",
    target: "node",
    minify: true
  }
].map(parser => {
  const name = getFileOutput(parser)
    .replace(/\.js$/, "")
    .split("-")[1];
  return Object.assign(parser, { type: "plugin", name });
});

const bundles = [
  {
    input: "index.js",
    type: "core",
    target: "node",
    external: [path.resolve("src/common/third-party.js")]
  },
  {
    input: "standalone.js",
    type: "core",
    target: "universal",
    name: "prettier"
  },
  {
    input: "bin/prettier.js",
    type: "core",
    output: "bin-prettier.js",
    target: "node",
    external: [path.resolve("src/common/third-party.js")],
    executable: true
  },
  {
    input: "src/common/third-party.js",
    type: "core",
    target: "node",
    replace: {
      // The require-from-string module (a dependency of cosmiconfig) assumes
      // that `module.parent` exists, but it only does for `require`:ed modules.
      // Usually, require-from-string is _always_ `require`:ed, but when bundled
      // with rollup the module is turned into a plain function located directly
      // in index.js so `module.parent` does not exist. Defaulting to `module`
      // instead seems to work.
      "module.parent": "(module.parent || module)"
    }
  }
].concat(parsers);

function getFileOutput(bundle) {
  return bundle.output || path.basename(bundle.input);
}

module.exports = { bundles, getFileOutput };
