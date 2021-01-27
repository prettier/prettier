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

function canBreakAssignmentRight(leftNode, rightNode, options) {
  if (isBinaryish(rightNode) && !shouldInlineLogicalExpression(rightNode)) {
    return true;
  }

  switch (rightNode.type) {
    case "StringLiteralTypeAnnotation":
    case "SequenceExpression":
      return true;
    case "ConditionalExpression": {
      const { test } = rightNode;
      if (isBinaryish(test) && !shouldInlineLogicalExpression(test)) {
        return true;
      }
      break;
    }
    case "ClassExpression": {
      if (isNonEmptyArray(rightNode.decorators)) {
        return true;
      }
      break;
    }
  }

  // do not put values on a separate line from the key in json
  if (options.parser === "json5" || options.parser === "json") {
    return false;
  }

  if (
    (leftNode.type === "Identifier" ||
      isStringLiteral(leftNode) ||
      leftNode.type === "MemberExpression") &&
    (isStringLiteral(getUnaryArgument(rightNode)) ||
      isMemberExpressionChain(getUnaryArgument(rightNode)))
  ) {
    return true;
  }

  return false;
}

module.exports = {
  printVariableDeclarator,
  printAssignmentExpression,
  printAssignment,
  printAssignmentRight,
};
