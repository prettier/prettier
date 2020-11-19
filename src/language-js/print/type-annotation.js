"use strict";
const {
  builders: { concat },
} = require("../../document");
const {
  isFlowAnnotationComment,
  isSimpleType,
  isObjectType,
} = require("../utils");

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

function shouldHugType(node) {
  if (isSimpleType(node) || isObjectType(node)) {
    return true;
  }

  if (node.type === "UnionTypeAnnotation" || node.type === "TSUnionType") {
    const voidCount = node.types.filter(
      (n) =>
        n.type === "VoidTypeAnnotation" ||
        n.type === "TSVoidKeyword" ||
        n.type === "NullLiteralTypeAnnotation" ||
        n.type === "TSNullKeyword"
    ).length;

    const hasObject = node.types.some(
      (n) =>
        n.type === "ObjectTypeAnnotation" ||
        n.type === "TSTypeLiteral" ||
        // This is a bit aggressive but captures Array<{x}>
        n.type === "GenericTypeAnnotation" ||
        n.type === "TSTypeReference"
    );

    if (node.types.length - 1 === voidCount && hasObject) {
      return true;
    }
  }

  return false;
}

module.exports = { printTypeAnnotation, shouldHugType };
