"use strict";

const { isNonEmptyArray, getStringWidth } = require("../../common/util");
const {
  builders: { line, group, indent, indentIfBreak },
  utils: { cleanDoc },
} = require("../../document");
const {
  hasLeadingOwnLineComment,
  isBinaryish,
  isStringLiteral,
  isNumericLiteral,
  isCallExpression,
  isMemberExpression,
  getCallArguments,
  isSimpleCallArgument,
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
  const layout = chooseLayout(path, options, leftDoc, rightPropertyName);

  const rightDoc = print(rightPropertyName, { assignmentLayout: layout });

  switch (layout) {
    // First break after operator, then the sides are broken independently on their own lines
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

    case "break-lhs": {
      const leftDoc2 =
        leftDoc.type === "group" && !leftDoc.break ? leftDoc.contents : leftDoc;
      return group([leftDoc2, operator, " ", group(rightDoc)]);
    }

    // Parts of assignment chains aren't wrapped in groups.
    // Once one of them breaks, the chain breaks too.
    case "chain":
      return [group(leftDoc), operator, line, rightDoc];

    case "chain-tail":
      return [group(leftDoc), operator, indent([line, rightDoc])];

    case "chain-tail-arrow-chain":
      return [group(leftDoc), operator, rightDoc];

    case "only-left":
      return leftDoc;
  }
}

function printAssignmentExpression(path, options, print) {
  const node = path.getValue();
  return printAssignment(
    path,
    options,
    print,
    print("left"),
    [" ", node.operator],
    "right"
  );
}

function printVariableDeclarator(path, options, print) {
  return printAssignment(path, options, print, print("id"), " =", "init");
}

function chooseLayout(path, options, leftDoc, rightPropertyName) {
  const node = path.getValue();
  const rightNode = node[rightPropertyName];

  if (!rightNode) {
    return "only-left";
  }

  // Short assignment chains (only 2 segments) are NOT formatted as chains.
  //   1) a = b = c; (expression statements)
  //   2) var/let/const a = b = c;

  const isTail = !isAssignment(rightNode);
  const shouldUseChainFormatting = path.match(
    isAssignment,
    (node) => isAssignment(node) || node.type === "VariableDeclarator",
    (node) =>
      !isTail ||
      (node.type !== "ExpressionStatement" &&
        node.type !== "VariableDeclaration")
  );
  if (shouldUseChainFormatting) {
    return !isTail
      ? "chain"
      : rightNode.type === "ArrowFunctionExpression" &&
        rightNode.body.type === "ArrowFunctionExpression"
      ? "chain-tail-arrow-chain"
      : "chain-tail";
  }
  const isHeadOfLongChain = !isTail && isAssignment(rightNode.right);

  if (
    isHeadOfLongChain ||
    hasLeadingOwnLineComment(options.originalText, rightNode)
  ) {
    return "break-after-operator";
  }

  // do not put values on a separate line from the key in json
  if (options.parser === "json5" || options.parser === "json") {
    return "never-break-after-operator";
  }

  if (isComplexObjectDestructuring(node)) {
    return "break-lhs";
  }

  // wrapping object properties with very short keys usually doesn't add much value
  const hasShortKey = isObjectPropertyWithShortKey(node, leftDoc, options);

  if (shouldBreakAfterOperator(rightNode, hasShortKey)) {
    return "break-after-operator";
  }

  if (hasShortKey || shouldNeverBreakAfterOperator(rightNode)) {
    return "never-break-after-operator";
  }

  return "fluid";
}

function shouldBreakAfterOperator(rightNode, hasShortKey) {
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

  if (hasShortKey) {
    return false;
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
  if (
    isStringLiteral(node) ||
    isMemberExpressionChainWithSimpleCalls(node) ||
    (isSimpleCall(node) &&
      isSimpleCall(node.callee) &&
      (isMemberExpressionChainHead(node.callee.callee) ||
        isMemberExpressionChainWithSimpleCalls(node.callee.callee)))
  ) {
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

// prefer to break destructuring object assignment
// if it includes default values or non-shorthand properties
function isComplexObjectDestructuring(node) {
  if (isAssignment(node) || node.type === "VariableDeclarator") {
    const leftNode = node.left || node.id;
    return (
      leftNode.type === "ObjectPattern" &&
      leftNode.properties.length > 2 &&
      leftNode.properties.some(
        (property) =>
          (property.type === "ObjectProperty" ||
            property.type === "Property") &&
          (!property.shorthand ||
            (property.value && property.value.type === "AssignmentPattern"))
      )
    );
  }
  return false;
}

function isAssignment(node) {
  return node.type === "AssignmentExpression";
}

function isMemberExpressionChainHead(node) {
  return node.type === "Identifier" || node.type === "ThisExpression";
}

function isMemberExpressionChainWithSimpleCalls(node) {
  if (!isMemberExpression(node)) {
    return false;
  }
  let { object } = node;
  for (;;) {
    if (object.type === "TSNonNullExpression") {
      object = object.expression;
    } else if (isCallExpression(object)) {
      if (!isSimpleCall(object)) {
        return false;
      }
      object = object.callee;
    } else {
      break;
    }
  }
  return (
    isMemberExpressionChainHead(object) ||
    isMemberExpressionChainWithSimpleCalls(object)
  );
}

function isSimpleCall(node) {
  if (!isCallExpression(node)) {
    return false;
  }
  const args = getCallArguments(node);
  return (
    args.length === 0 || (args.length === 1 && isSimpleCallArgument(args[0], 1))
  );
}

function isObjectPropertyWithShortKey(node, keyDoc, options) {
  if (node.type !== "ObjectProperty" && node.type !== "Property") {
    return false;
  }
  // TODO: for performance, it might make sense to use a more lightweight
  // version of cleanDoc, such that it would stop once it detects that
  // the doc can't be reduced to a string.
  keyDoc = cleanDoc(keyDoc);
  const MIN_OVERLAP_FOR_BREAK = 3;
  //   ↓↓ - insufficient overlap for a line break
  // key1: longValue1,
  //   ↓↓↓↓↓↓ - overlap is long enough to break
  // key2abcd:
  //   longValue2
  return (
    typeof keyDoc === "string" &&
    getStringWidth(keyDoc) < options.tabWidth + MIN_OVERLAP_FOR_BREAK
  );
}

module.exports = {
  printVariableDeclarator,
  printAssignmentExpression,
  printAssignment,
};
