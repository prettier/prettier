"use strict";

function preprocess(ast, options) {
  switch (options.parser) {
    case "json":
    case "json5":
    case "json-stringify":
      return Object.assign({}, ast, {
        type: "JsonRoot",
        node: Object.assign({}, ast, { comments: [] })
      });
    default:
      return ast;
  }
}

module.exports = preprocess;
