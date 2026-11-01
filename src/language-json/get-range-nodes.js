const jsonSourceElements = new Set([
  "JsonRoot",
  "ObjectExpression",
  "ArrayExpression",
  "StringLiteral",
  "NumericLiteral",
  "BooleanLiteral",
  "NullLiteral",
  "UnaryExpression",
  "TemplateLiteral",
]);

function getRangeNodes(startNodeAndAncestors, endNodeAndAncestors) {
  endNodeAndAncestors = new Set(endNodeAndAncestors);
  const commonAncestor = startNodeAndAncestors.find(
    (node) =>
      jsonSourceElements.has(node.type) && endNodeAndAncestors.has(node),
  );
  return { startNode: commonAncestor, endNode: commonAncestor };
}

export { getRangeNodes };
