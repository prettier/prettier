"use strict";

const jsonSourceElements = new Set([
  "ObjectExpression",
  "ArrayExpression",
  "StringLiteral",
  "NumericLiteral",
  "BooleanLiteral",
  "NullLiteral",
  "UnaryExpression",
  "TemplateLiteral",
]);
function isJsonSourceElement(node) {
  return jsonSourceElements.has(node.type);
}

function isSourceElement(node, parentNode, opts) {
  if (
    opts.parser === "json" ||
    opts.parser === "json5" ||
    opts.parser === "json-stringify"
  ) {
    return isJsonSourceElement(node);
  }
  const parentNodeType = parentNode && parentNode.type;
  // See https://www.ecma-international.org/ecma-262/5.1/#sec-A.5
  return (
    parentNodeType !== "DeclareExportDeclaration" &&
    node.type !== "TypeParameterDeclaration" &&
    (node.type === "Directive" ||
      node.type === "TypeAlias" ||
      node.type === "TSExportAssignment" ||
      node.type.startsWith("Declare") ||
      node.type.startsWith("TSDeclare") ||
      node.type.endsWith("Statement") ||
      node.type.endsWith("Declaration"))
  );
}

function findJsonAncestors(startNodeAndParents, endNodeAndParents) {
  const startNodeAndAncestors = [
    startNodeAndParents.node,
    ...startNodeAndParents.parentNodes,
  ];
  const endNodeAndAncestors = new Set([
    endNodeAndParents.node,
    ...endNodeAndParents.parentNodes,
  ]);
  const node = startNodeAndAncestors.find(
    (node) => isJsonSourceElement(node) && endNodeAndAncestors.has(node)
  );
  return { startNode: node, endNode: node };
}

module.exports = { isSourceElement, findJsonAncestors, isJsonSourceElement };
