"use strict";

const { isNextLineEmpty } = require("../../common/util");
const {
  builders: { concat, indent, join, line, hardline },
} = require("../../document");
const { isFlowAnnotationComment } = require("../utils");
const { locEnd } = require("../loc");

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

function printTypeAnnotation(path, options, print) {
  const node = path.getValue();
  if (!node.typeAnnotation) {
    return "";
  }

  const parentNode = path.getParentNode();
  const isDefinite =
    node.definite ||
    (parentNode &&
      parentNode.type === "VariableDeclarator" &&
      parentNode.definite);

  const isFunctionDeclarationIdentifier =
    parentNode.type === "DeclareFunction" && parentNode.id === node;

  if (isFlowAnnotationComment(options.originalText, node.typeAnnotation)) {
    return concat([" /*: ", path.call(print, "typeAnnotation"), " */"]);
  }

  return concat([
    isFunctionDeclarationIdentifier ? "" : isDefinite ? "!: " : ": ",
    path.call(print, "typeAnnotation"),
  ]);
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

function adjustClause(node, clause, forceSpace) {
  if (node.type === "EmptyStatement") {
    return ";";
  }

  if (node.type === "BlockStatement" || forceSpace) {
    return concat([" ", clause]);
  }

  return indent(concat([line, clause]));
}

function printBabelDirectives(path, options, print, hasContents) {
  const semi = options.semi ? ";" : "";
  const lastDirectiveIndex = path.getValue().directives.length - 1;
  return join(
    hardline,
    path.map(
      (childPath, index) =>
        concat([
          print(childPath),
          semi,
          (hasContents || index !== lastDirectiveIndex) &&
          isNextLineEmpty(options.originalText, childPath.getValue(), locEnd)
            ? hardline
            : "",
        ]),
      "directives"
    )
  );
}

function hasBabelDirectives(node) {
  return Array.isArray(node.directives) && node.directives.length > 0;
}

module.exports = {
  printOptionalToken,
  printFunctionTypeParameters,
  printBindExpressionCallee,
  printTypeScriptModifiers,
  printTypeAnnotation,
  printBabelDirectives,
  adjustClause,
  hasBabelDirectives,
};
