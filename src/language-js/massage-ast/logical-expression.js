function rebalanceLogicalExpression(node) {
  while (
    node.type === "LogicalExpression" &&
    node.right.type === "LogicalExpression" &&
    node.operator === node.right.operator
  ) {
    node.left = rebalanceLogicalExpression({
      type: "LogicalExpression",
      operator: node.operator,
      left: node.left,
      right: node.right.left,
    });
    node.right = node.right.right;
  }

  return node;
}

function cleanLogicalExpression(original, cloned) {
  if (original.type === "LogicalExpression") {
    rebalanceLogicalExpression(cloned);
  }
}

export { cleanLogicalExpression };
