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
  path,
  options,
  print,
  printedLeft,
  operator,
  rightPropertyName
) {
  const node = path.getValue();
  const rightNode = node[rightPropertyName];

  if (!rightNode) {
    return printedLeft;
  }

  const printedRight = path.call(print, rightPropertyName);
  const isNestedAssignment =
    path.getParentNode().type === "AssignmentExpression";

  const { doc: printed, separateLineBreak } = printAssignmentRight(
    printedLeft,
    printedRight,
    rightNode,
    isNestedAssignment,
    options
  );

  let result;

  if (separateLineBreak) {
    const groupId = Symbol("assignment");
    result = [
      group([group(printedLeft), operator]),
      group(indent(line), { id: groupId }),
      ifBreak(indent(printed), printed, { groupId }),
    ];
  } else {
    result = [group(printedLeft), operator, printed];
  }

  return isNestedAssignment ? result : group(result);
}

function printAssignmentExpression(path, options, print) {
  const n = path.getValue();
  return printAssignment(
    path,
    options,
    print,
    path.call(print, "left"),
    [" ", n.operator],
    "right"
  );
}

function printVariableDeclarator(path, options, print) {
  return printAssignment(
    path,
    options,
    print,
    path.call(print, "id"),
    " =",
    "init"
  );
}

function printAssignmentRight(
  printedLeft,
  printedRight,
  rightNode,
  isNestedAssignment,
  options
) {
  if (rightNode.type === "AssignmentExpression") {
    if (isNestedAssignment) {
      return { doc: [line, printedRight] };
    }
    if (rightNode.right.type === "AssignmentExpression") {
      return { doc: group(indent([line, printedRight])) };
    }
  } else if (isNestedAssignment) {
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
  if (hasLeadingOwnLineComment(options.originalText, rightNode)) {
    return true;
  }

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
