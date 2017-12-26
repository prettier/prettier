"use strict";

function cleanAST(ast, parser) {
  return JSON.stringify(massageAST(ast, parser), null, 2);
}

function massageAST(ast, parser, parent) {
  if (Array.isArray(ast)) {
    return ast.map(e => massageAST(e, parser, parent)).filter(e => e);
  }

  if (!ast || typeof ast !== "object") {
    return ast;
  }

  const newObj = {};
  for (const key in ast) {
    if (typeof ast[key] !== "function") {
      newObj[key] = massageAST(ast[key], parser, ast);
    }
  }

  [
    "loc",
    "range",
    "raw",
    "comments",
    "leadingComments",
    "trailingComments",
    "extra",
    "start",
    "end",
    "tokens",
    "flags",
    "raws",
    "sourceIndex",
    "id",
    "source",
    "before",
    "after",
    "trailingComma",
    "parent",
    "prev",
    "position"
  ].forEach(name => {
    delete newObj[name];
  });

  if (parser.massageAstNode) {
    const result = parser.massageAstNode(ast, newObj, parent);
    if (result === null) {
      return undefined;
    }
    if (result) {
      return result;
    }
  }

  return newObj;
}

module.exports = { cleanAST, massageAST };
