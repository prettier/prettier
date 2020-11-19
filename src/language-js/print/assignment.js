"use strict";

const {
  builders: { concat, line, group, indent },
} = require("../../document");
const {
  hasLeadingOwnLineComment,
  isBinaryish,
  isMemberExpressionChain,
  isStringLiteral,
} = require("../utils");
const { shouldInlineLogicalExpression } = require("./misc");

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

  return group(concat([printedLeft, operator, printed]));
}

function printAssignmentRight(leftNode, rightNode, printedRight, options) {
  if (hasLeadingOwnLineComment(options.originalText, rightNode)) {
    return indent(concat([line, printedRight]));
  }

  const canBreak =
    (isBinaryish(rightNode) && !shouldInlineLogicalExpression(rightNode)) ||
    (rightNode.type === "ConditionalExpression" &&
      isBinaryish(rightNode.test) &&
      !shouldInlineLogicalExpression(rightNode.test)) ||
    rightNode.type === "StringLiteralTypeAnnotation" ||
    (rightNode.type === "ClassExpression" &&
      rightNode.decorators &&
      rightNode.decorators.length) ||
    ((leftNode.type === "Identifier" ||
      isStringLiteral(leftNode) ||
      leftNode.type === "MemberExpression") &&
      (isStringLiteral(rightNode) || isMemberExpressionChain(rightNode)) &&
      // do not put values on a separate line from the key in json
      options.parser !== "json" &&
      options.parser !== "json5") ||
    rightNode.type === "SequenceExpression";

  if (canBreak) {
    return group(indent(concat([line, printedRight])));
  }

  return concat([" ", printedRight]);
}

module.exports = { printAssignment };
