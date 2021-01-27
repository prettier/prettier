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

  /**
   * @param {Node} node
   * @returns {Node}
   */
  function getUnaryArgument(node) {
    if (node.type === "UnaryExpression") {
      return node.argument;
    }
    return node;
  }

  const canBreak =
    (isBinaryish(rightNode) && !shouldInlineLogicalExpression(rightNode)) ||
    (rightNode.type === "ConditionalExpression" &&
      isBinaryish(rightNode.test) &&
      !shouldInlineLogicalExpression(rightNode.test)) ||
    rightNode.type === "StringLiteralTypeAnnotation" ||
    (rightNode.type === "ClassExpression" &&
      isNonEmptyArray(rightNode.decorators)) ||
    ((leftNode.type === "Identifier" ||
      isStringLiteral(leftNode) ||
      leftNode.type === "MemberExpression") &&
      (isStringLiteral(getUnaryArgument(rightNode)) ||
        isMemberExpressionChain(getUnaryArgument(rightNode))) &&
      // do not put values on a separate line from the key in json
      options.parser !== "json" &&
      options.parser !== "json5") ||
    rightNode.type === "SequenceExpression";

  if (canBreak) {
    return group(indent([line, printedRight]));
  }

  return [" ", printedRight];
}

module.exports = {
  printVariableDeclarator,
  printAssignmentExpression,
  printAssignment,
  printAssignmentRight,
};
