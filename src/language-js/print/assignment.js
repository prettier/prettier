"use strict";

const { isNonEmptyArray } = require("../../common/util");
const {
  builders: { line, group, indent, indentIfBreak },
} = require("../../document");
const {
  hasLeadingOwnLineComment,
  isBinaryish,
  isMemberExpressionChain,
  isStringLiteral,
  isNumericLiteral,
} = require("../utils");
const { shouldInlineLogicalExpression } = require("./binaryish");

function printAssignment(
  path,
  options,
  print,
  leftDoc,
  operator,
  rightPropertyName
) {
  const rightNode = path.getValue()[rightPropertyName];
  if (!rightNode) {
    return leftDoc;
  }
  const rightDoc = path.call(print, rightPropertyName);
  const isNested = path.getParentNode().type === "AssignmentExpression";

  switch (chooseLayout(rightNode, isNested, options)) {
    // First break after operator, then break left-hand side
    default:
    case "break-after-operator":
      return group([group(leftDoc), operator, group(indent([line, rightDoc]))]);

    // First break right-hand side, then left-hand side
    case "never-break-after-operator":
      return group([group(leftDoc), operator, " ", rightDoc]);

    // First break right-hand side, then after operator
    case "fluid": {
      const groupId = Symbol("assignment");
      return group([
        group(leftDoc),
        operator,
        group(indent(line), { id: groupId }),
        indentIfBreak(rightDoc, { groupId }),
      ]);
    }

    // Parts of assignment chains aren't wrapped in groups.
    // Once one of them breaks, the chain breaks too.
    case "chain":
      return [group(leftDoc), operator, line, rightDoc];

    case "end-of-chain":
      return [group(leftDoc), operator, indent([line, rightDoc])];
  }
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

function chooseLayout(rightNode, isNested, options) {
  if (rightNode.type === "AssignmentExpression") {
    if (isNested) {
      return "chain";
    }
    if (rightNode.right.type === "AssignmentExpression") {
      return "break-after-operator";
    }
    // `const a = b = c;` falls through here, but `const a = b = c = d;` doesn't.
  } else if (isNested) {
    return "end-of-chain";
  }

  if (hasLeadingOwnLineComment(options.originalText, rightNode)) {
    return "break-after-operator";
  }

  // do not put values on a separate line from the key in json
  if (options.parser === "json5" || options.parser === "json") {
    return "never-break-after-operator";
  }

  if (shouldBreakAfterOperator(rightNode)) {
    return "break-after-operator";
  }

  if (shouldNeverBreakAfterOperator(rightNode)) {
    return "never-break-after-operator";
  }

  return "fluid";
}

function shouldBreakAfterOperator(rightNode) {
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
  for (;;) {
    if (node.type === "UnaryExpression") {
      node = node.argument;
    } else if (node.type === "TSNonNullExpression") {
      node = node.expression;
    } else {
      break;
    }
  }
  if (isStringLiteral(node) || isMemberExpressionChain(node)) {
    return true;
  }

  return false;
}

function shouldNeverBreakAfterOperator(rightNode) {
  return (
    rightNode.type === "TemplateLiteral" ||
    rightNode.type === "TaggedTemplateExpression" ||
    rightNode.type === "BooleanLiteral" ||
    isNumericLiteral(rightNode) ||
    (rightNode.type === "CallExpression" &&
      rightNode.callee.name === "require") ||
    rightNode.type === "ClassExpression"
  );
}

module.exports = {
  printVariableDeclarator,
  printAssignmentExpression,
  printAssignment,
};
