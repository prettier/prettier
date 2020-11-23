"use strict";

/** @type {import("assert")} */
const assert = require("assert");
const {
  builders: { concat, indent, join, line },
} = require("../../document");
const { getParentExportDeclaration } = require("../utils");

function printOptionalToken(path) {
  const node = path.getValue();
  if (
    !node.optional ||
    // It's an optional computed method parsed by typescript-estree.
    // "?" is printed in `printMethod`.
    (node.type === "Identifier" && node === path.getParentNode().key)
  ) {
    return "";
  }
  if (
    node.type === "OptionalCallExpression" ||
    (node.type === "OptionalMemberExpression" && node.computed)
  ) {
    return "?.";
  }
  return "?";
}

function printFunctionTypeParameters(path, options, print) {
  const fun = path.getValue();
  if (fun.typeArguments) {
    return path.call(print, "typeArguments");
  }
  if (fun.typeParameters) {
    return path.call(print, "typeParameters");
  }
  return "";
}

function printBindExpressionCallee(path, options, print) {
  return concat(["::", path.call(print, "callee")]);
}

function printTypeScriptModifiers(path, options, print) {
  const n = path.getValue();
  if (!n.modifiers || !n.modifiers.length) {
    return "";
  }
  return concat([join(" ", path.map(print, "modifiers")), " "]);
}

function printFlowDeclaration(path, printed) {
  const parentExportDecl = getParentExportDeclaration(path);

  if (parentExportDecl) {
    assert.strictEqual(parentExportDecl.type, "DeclareExportDeclaration");
    return printed;
  }

  // If the parent node has type DeclareExportDeclaration, then it
  // will be responsible for printing the "declare" token. Otherwise
  // it needs to be printed with this non-exported declaration node.
  return concat(["declare ", printed]);
}

function adjustClause(node, clause, forceSpace) {
  if (node.type === "EmptyStatement") {
    return ";";
  }

  if (node.type === "BlockStatement" || forceSpace) {
    return concat([" ", clause]);
  }

  return indent(concat([line, clause]));
}

module.exports = {
  printOptionalToken,
  printFunctionTypeParameters,
  printBindExpressionCallee,
  printTypeScriptModifiers,
  printFlowDeclaration,
  adjustClause,
};
