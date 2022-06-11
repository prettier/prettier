"use strict";

const { isNonEmptyArray } = require("../../common/util.js");
const {
  builders: { indent, join, line },
} = require("../../document/index.js");
const { isFlowAnnotationComment } = require("../utils/index.js");

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

function printDefiniteToken(path) {
  return path.getValue().definite ||
    path.match(
      undefined,
      (node, name) =>
        name === "id" && node.type === "VariableDeclarator" && node.definite
    )
    ? "!"
    : "";
}

function printFunctionTypeParameters(path, options, print) {
  const fun = path.getValue();
  if (fun.typeArguments) {
    return print("typeArguments");
  }
  if (fun.typeParameters) {
    return print("typeParameters");
  }
  return "";
}

function printTypeAnnotation(path, options, print) {
  const node = path.getValue();
  if (!node.typeAnnotation) {
    return "";
  }

  const parentNode = path.getParentNode();

  const isFunctionDeclarationIdentifier =
    parentNode.type === "DeclareFunction" && parentNode.id === node;

  if (isFlowAnnotationComment(options.originalText, node.typeAnnotation)) {
    return [" /*: ", print("typeAnnotation"), " */"];
  }

  return [isFunctionDeclarationIdentifier ? "" : ": ", print("typeAnnotation")];
}

function printBindExpressionCallee(path, options, print) {
  return ["::", print("callee")];
}

function printTypeScriptModifiers(path, options, print) {
  const node = path.getValue();
  if (!isNonEmptyArray(node.modifiers)) {
    return "";
  }
  return [join(" ", path.map(print, "modifiers")), " "];
}

function adjustClause(node, clause, forceSpace) {
  if (node.type === "EmptyStatement") {
    return ";";
  }

  if (node.type === "BlockStatement" || forceSpace) {
    return [" ", clause];
  }

  return indent([line, clause]);
}

function printRestSpread(path, options, print) {
  return ["...", print("argument"), printTypeAnnotation(path, options, print)];
}

module.exports = {
  printOptionalToken,
  printDefiniteToken,
  printFunctionTypeParameters,
  printBindExpressionCallee,
  printTypeScriptModifiers,
  printTypeAnnotation,
  printRestSpread,
  adjustClause,
};
