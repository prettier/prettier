"use strict";

const replace = require("rollup-plugin-replace");

const custom = [
  {
    name: "typescript-eslint-parser",
    extraPlugins: [
      replace({
        "exports.Syntax =": "1,",
        include: "node_modules/typescript-eslint-parser/parser.js"
      })
    ]
  },
  {
    name: "flow-parser",
    extraPlugins: [
      // In flow-parser 0.59.0 there's a dynamic require: `require(s8)` which not
      // supported by rollup-plugin-commonjs, so we have to replace the variable
      // by its value before bundling.
      replace({
        "require(s8)": 'require("fs")',
        include: "node_modules/flow-parser/flow_parser.js"
      })
    ],
    noMinify: true,
    loose: true
  },
  { name: "graphql/language", outName: "graphql-language", pkg: "graphql" },
  { name: "@glimmer/syntax", outName: "glimmer-syntax" },
  { name: "babylon" },
  { name: "remark-parse" },
  { name: "parse5" },
  { name: "postcss-less" },
  { name: "postcss-media-query-parser" },
  { name: "postcss-scss" },
  { name: "postcss-selector-parser" },
  { name: "postcss-values-parser" },
  {
    name: "cosmiconfig",
    browser: false,
    extraPlugins: [
      replace({
        // The require-from-string module (a dependency of cosmiconfig) assumes
        // that `module.parent` exists, but it only does for `require`:ed modules.
        // Usually, require-from-string is _always_ `require`:ed, but when bundled
        // with rollup the module is turned into a plain function located directly
        // in index.js so `module.parent` does not exist. Defaulting to `module`
        // instead seems to work.
        "module.parent": "(module.parent || module)"
      })
    ]
  },
  { name: "get-stream" },
  { name: "read-pkg-up" }
];

module.exports = custom;
