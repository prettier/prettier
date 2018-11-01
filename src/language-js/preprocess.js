"use strict";

function preprocess(ast, options) {
  switch (options.parser) {
    case "json":
    case "json5":
    case "json-stringify":
    case "__js_expression":
      return Object.assign({}, ast, {
        type:
          options.parser === "__js_expression"
            ? "JsExpressionRoot"
            : "JsonRoot",
        node: ast,
        comments: []
      });
    default:
      return ast;
  }
}

module.exports = preprocess;
