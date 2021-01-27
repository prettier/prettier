"use strict";

const { isNonEmptyArray } = require("../../common/util");
const {
  builders: { line, group, indent },
} = require("../../document");
const {
  hasLeadingOwnLineComment,
  isBinaryish,
  isMemberExpressionChain,
  isStringLiteral,
} = require("../utils");
const { shouldInlineLogicalExpression } = require("./binaryish");

/**
 * @typedef {import("../types/estree").Node} Node
 */

function printAssignment(
  leftNode,
  printedLeft,
  operator,
  rightNode,
  printedRight,
  options
) {
  if (!rightNode) {
    return printedLeft;
  }

  const printed = printAssignmentRight(
    leftNode,
    rightNode,
    printedRight,
    options
  );

  return group([printedLeft, operator, printed]);
}

function printAssignmentExpression(path, options, print) {
  const n = path.getValue();
  return printAssignment(
    n.left,
    path.call(print, "left"),
    [" ", n.operator],
    n.right,
    path.call(print, "right"),
    options
  );
}

function printVariableDeclarator(path, options, print) {
  const n = path.getValue();
  return printAssignment(
    n.id,
    path.call(print, "id"),
    " =",
    n.init,
    n.init && path.call(print, "init"),
    options
  );
}

function printAssignmentRight(leftNode, rightNode, printedRight, options) {
  if (hasLeadingOwnLineComment(options.originalText, rightNode)) {
    return indent([line, printedRight]);
  }

  if (canBreakAssignmentRight(leftNode, rightNode, options)) {
    return group(indent([line, printedRight]));
  }

  return [" ", printedRight];
}

/**
 * @param {Node} node
 * @returns {Node}
 */
function getUnaryArgument(node) {
  while (node.type === "UnaryExpression") {
    node = node.argument;
  }
  return node;
}

function canBreakUnaryExpression(leftNode, rightNode, options) {
  if (
    leftNode.type !== "Identifier" &&
    leftNode.type !== "MemberExpression" &&
    !isStringLiteral(leftNode)
  ) {
    return false;
  }

  const unaryExpressionArgument = getUnaryArgument(rightNode);
  return (
    isStringLiteral(unaryExpressionArgument) ||
    isMemberExpressionChain(unaryExpressionArgument)
  );
}

function canBreakAssignmentRight(leftNode, rightNode, options) {
  // do not put values on a separate line from the key in json
  if (options.parser === "json5" || options.parser === "json") {
    return false;
  }

  if (isBinaryish(rightNode) && !shouldInlineLogicalExpression(rightNode)) {
    return true;
  }

  switch (rightNode.type) {
    case "StringLiteralTypeAnnotation":
    case "SequenceExpression":
      return true;
    case "ConditionalExpression": {
      const { test } = rightNode;
      return isBinaryish(test) && !shouldInlineLogicalExpression(test);
    }
    case "ClassExpression":
      return isNonEmptyArray(rightNode.decorators);
    case "UnaryExpression": {
      return canBreakUnaryExpression(leftNode, rightNode, options);
    }
  }

  return false;
}

module.exports = {
  printVariableDeclarator,
  printAssignmentExpression,
  printAssignment,
  printAssignmentRight,
};
