"use strict";

const { isNonEmptyArray } = require("../../common/util");
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
  const rightDoc = path.call(print, rightPropertyName);

  switch (chooseLayout(path, options, leftDoc, rightPropertyName)) {
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

    // Parts of assignment chains aren't wrapped in groups.
    // Once one of them breaks, the chain breaks too.
    case "chain":
      return [group(leftDoc), operator, line, rightDoc];

    case "chain-tail":
      return [group(leftDoc), operator, indent([line, rightDoc])];

    case "only-left":
      return leftDoc;
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
    return isTail ? "chain-tail" : "chain";
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
  // TODO: a more lightweight version of cleanDoc is needed that would stop once it's
  // detected that the doc can't be normalized into a string.
  keyDoc = cleanDoc(keyDoc);
  const MIN_OVERLAP_FOR_BREAK = 3;
  //   ↓↓ - insufficient overlap for a line break
  // key1: longValue1,
  //   ↓↓↓↓↓↓ - overlap is long enough to break
  // key2abcd:
  //   longValue2
  return (
    typeof keyDoc === "string" &&
    keyDoc.length < options.tabWidth + MIN_OVERLAP_FOR_BREAK
  );
}

module.exports = {
  printVariableDeclarator,
  printAssignmentExpression,
  printAssignment,
};
