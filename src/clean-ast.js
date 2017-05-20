"use strict";

function cleanAST(ast) {
  return JSON.stringify(massageAST(ast), null, 2);
}

function massageAST(ast) {
  if (Array.isArray(ast)) {
    return ast.map(e => massageAST(e)).filter(e => e);
  }
  if (ast && typeof ast === "object") {
    // We remove extra `;` and add them when needed
    if (ast.type === "EmptyStatement") {
      return undefined;
    }

    // We move text around, including whitespaces and add {" "}
    if (ast.type === "JSXText") {
      return undefined;
    }
    if (
      ast.type === "JSXExpressionContainer" &&
      ast.expression.type === "Literal" &&
      ast.expression.value === " "
    ) {
      return undefined;
    }

    const newObj = {};
    for (const key in ast) {
      newObj[key] = massageAST(ast[key]);
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
      "after"
    ].forEach(name => {
      delete newObj[name];
    });

    if (
      ast.type === "media-query" ||
      ast.type === "media-query-list" ||
      ast.type === "media-feature-expression"
    ) {
      delete newObj.value;
    }

    // We convert <div></div> to <div />
    if (ast.type === "JSXOpeningElement") {
      delete newObj.selfClosing;
    }
    if (ast.type === "JSXElement") {
      delete newObj.closingElement;
    }

    // We change {'key': value} into {key: value}
    if (
      (ast.type === "Property" ||
        ast.type === "MethodDefinition" ||
        ast.type === "ClassProperty") &&
      typeof ast.key === "object" &&
      ast.key &&
      (ast.key.type === "Literal" || ast.key.type === "Identifier")
    ) {
      delete newObj.key;
    }

    return newObj;
  }
  return ast;
}

module.exports = { cleanAST, massageAST };
