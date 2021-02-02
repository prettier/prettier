"use strict";

const { isNonEmptyArray } = require("../../common/util");
const {
  builders: { line, group, indent, ifBreak },
  utils: { canBreak },
} = require("../../document");
const {
  hasLeadingOwnLineComment,
  isBinaryish,
  isMemberExpressionChain,
  isStringLiteral,
  isNumericLiteral,
} = require("../utils");
const { shouldInlineLogicalExpression } = require("./binaryish");

/**
 * @typedef {import("../types/estree").Node} Node
 */

function printAssignment(
  printedLeft,
  operator,
  rightNode,
  printedRight,
  options
) {
  if (!rightNode) {
    return printedLeft;
  }

  const { doc: printed, separateLineBreak } = printAssignmentRight(
    printedLeft,
    printedRight,
    rightNode,
    options
  );

  if (separateLineBreak) {
    const groupId = Symbol("assignment");
    return [
      group([group(printedLeft), operator]),
      group(indent(line), { id: groupId }),
      ifBreak(indent(printed), printed, { groupId }),
    ];
  }

  return group([group(printedLeft), operator, printed]);
}

function printAssignmentExpression(path, options, print) {
  const n = path.getValue();
  return printAssignment(
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
    path.call(print, "id"),
    " =",
    n.init,
    n.init && path.call(print, "init"),
    options
  );
}

function printAssignmentRight(printedLeft, printedRight, rightNode, options) {
  if (hasLeadingOwnLineComment(options.originalText, rightNode)) {
    return { doc: indent([line, printedRight]) };
  }

  if (shouldBreakAfterOperator(rightNode, options)) {
    return { doc: group(indent([line, printedRight])) };
  }

  if (shouldNeverBreakAfterOperator(rightNode, options)) {
    return { doc: [" ", printedRight] };
  }

  if (canBreak(printedLeft) || canBreak(printedRight)) {
    return { separateLineBreak: true, doc: printedRight };
  }

  return { doc: group(indent([line, printedRight])) };
}

function shouldBreakAfterOperator(rightNode, options) {
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
  }

  let node = rightNode;
  while (node.type === "UnaryExpression") {
    node = node.argument;
  }
  if (isStringLiteral(node) || isMemberExpressionChain(node)) {
    return true;
  }

  return false;
}

function shouldNeverBreakAfterOperator(rightNode, options) {
  return (
    rightNode.type === "TemplateLiteral" ||
    rightNode.type === "TaggedTemplateExpression" ||
    rightNode.type === "BooleanLiteral" ||
    isNumericLiteral(rightNode) ||
    (rightNode.type === "CallExpression" &&
      rightNode.callee.name === "require") ||
    rightNode.type === "ClassExpression" ||
    rightNode.type === "ParenthesizedExpression" ||
    options.parser === "json5" ||
    options.parser === "json"
  );
}

module.exports = {
  printVariableDeclarator,
  printAssignmentExpression,
  printAssignment,
};
