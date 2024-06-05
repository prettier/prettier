import {
  group,
  indent,
  indentIfBreak,
  line,
  lineSuffixBoundary,
} from "../../document/builders.js";
import { canBreak, cleanDoc, willBreak } from "../../document/utils.js";
import getStringWidth from "../../utils/get-string-width.js";
import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import {
  createTypeCheckFunction,
  getCallArguments,
  hasLeadingOwnLineComment,
  isBinaryish,
  isCallExpression,
  isIntersectionType,
  isLoneShortArgument,
  isMemberExpression,
  isNumericLiteral,
  isObjectProperty,
  isStringLiteral,
  isUnionType,
} from "../utils/index.js";
import { shouldInlineLogicalExpression } from "./binaryish.js";
import { printCallExpression } from "./call-expression.js";

/**
 * @typedef {import("../../common/ast-path.js").default} AstPath
 */

function printAssignment(
  path,
  options,
  print,
  leftDoc,
  operator,
  rightPropertyName,
) {
  const layout = chooseLayout(path, options, print, leftDoc, rightPropertyName);

  const rightDoc = rightPropertyName
    ? print(rightPropertyName, { assignmentLayout: layout })
    : "";

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
        lineSuffixBoundary,
        indentIfBreak(rightDoc, { groupId }),
      ]);
    }

    case "break-lhs":
      return group([leftDoc, operator, " ", group(rightDoc)]);

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
  const { node } = path;
  return printAssignment(
    path,
    options,
    print,
    print("left"),
    [" ", node.operator],
    "right",
  );
}

function printVariableDeclarator(path, options, print) {
  return printAssignment(path, options, print, print("id"), " =", "init");
}

function chooseLayout(path, options, print, leftDoc, rightPropertyName) {
  const { node } = path;
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
    isAssignmentOrVariableDeclarator,
    (node) =>
      !isTail ||
      (node.type !== "ExpressionStatement" &&
        node.type !== "VariableDeclaration"),
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

  if (
    node.type === "ImportAttribute" ||
    (rightNode.type === "CallExpression" &&
      rightNode.callee.name === "require") ||
    // do not put values on a separate line from the key in json
    options.parser === "json5" ||
    options.parser === "jsonc" ||
    options.parser === "json"
  ) {
    return "never-break-after-operator";
  }

  const canBreakLeftDoc = canBreak(leftDoc);

  if (
    isComplexDestructuring(node) ||
    hasComplexTypeAnnotation(node) ||
    (isArrowFunctionVariableDeclarator(node) && canBreakLeftDoc)
  ) {
    return "break-lhs";
  }

  // wrapping object properties with very short keys usually doesn't add much value
  const hasShortKey = isObjectPropertyWithShortKey(node, leftDoc, options);

  if (
    path.call(
      () => shouldBreakAfterOperator(path, options, print, hasShortKey),
      rightPropertyName,
    )
  ) {
    return "break-after-operator";
  }

  if (isComplexTypeAliasParams(node)) {
    return "break-lhs";
  }

  if (
    !canBreakLeftDoc &&
    (hasShortKey ||
      rightNode.type === "TemplateLiteral" ||
      rightNode.type === "TaggedTemplateExpression" ||
      rightNode.type === "BooleanLiteral" ||
      isNumericLiteral(rightNode) ||
      rightNode.type === "ClassExpression")
  ) {
    return "never-break-after-operator";
  }

  return "fluid";
}

function shouldBreakAfterOperator(path, options, print, hasShortKey) {
  const rightNode = path.node;

  if (isBinaryish(rightNode) && !shouldInlineLogicalExpression(rightNode)) {
    return true;
  }

  switch (rightNode.type) {
    case "StringLiteralTypeAnnotation":
    case "SequenceExpression":
      return true;
    case "TSConditionalType":
    case "ConditionalTypeAnnotation":
      if (
        !options.experimentalTernaries &&
        !shouldBreakBeforeConditionalType(rightNode)
      ) {
        break;
      }
      return true;
    case "ConditionalExpression": {
      if (!options.experimentalTernaries) {
        const { test } = rightNode;
        return isBinaryish(test) && !shouldInlineLogicalExpression(test);
      }
      const { consequent, alternate } = rightNode;
      return (
        consequent.type === "ConditionalExpression" ||
        alternate.type === "ConditionalExpression"
      );
    }
    case "ClassExpression":
      return isNonEmptyArray(rightNode.decorators);
  }

  if (hasShortKey) {
    return false;
  }

  let node = rightNode;
  const propertiesForPath = [];
  while (true) {
    if (
      node.type === "UnaryExpression" ||
      node.type === "AwaitExpression" ||
      (node.type === "YieldExpression" && node.argument !== null)
    ) {
      node = node.argument;
      propertiesForPath.push("argument");
    } else if (node.type === "TSNonNullExpression") {
      node = node.expression;
      propertiesForPath.push("expression");
    } else {
      break;
    }
  }
  if (
    isStringLiteral(node) ||
    path.call(
      () => isPoorlyBreakableMemberOrCallChain(path, options, print),
      ...propertiesForPath,
    )
  ) {
    return true;
  }

  return false;
}

// prefer to break destructuring assignment
// if it includes default values or non-shorthand properties
function isComplexDestructuring(node) {
  if (isAssignmentOrVariableDeclarator(node)) {
    const leftNode = node.left || node.id;
    return (
      leftNode.type === "ObjectPattern" &&
      leftNode.properties.length > 2 &&
      leftNode.properties.some(
        (property) =>
          isObjectProperty(property) &&
          (!property.shorthand || property.value?.type === "AssignmentPattern"),
      )
    );
  }
  return false;
}

function isAssignment(node) {
  return node.type === "AssignmentExpression";
}

function isAssignmentOrVariableDeclarator(node) {
  return isAssignment(node) || node.type === "VariableDeclarator";
}

function isComplexTypeAliasParams(node) {
  const typeParams = getTypeParametersFromTypeAlias(node);
  if (isNonEmptyArray(typeParams)) {
    const constraintPropertyName =
      node.type === "TSTypeAliasDeclaration" ? "constraint" : "bound";
    if (
      typeParams.length > 1 &&
      typeParams.some((param) => param[constraintPropertyName] || param.default)
    ) {
      return true;
    }
  }
  return false;
}

const isTypeAlias = createTypeCheckFunction([
  "TSTypeAliasDeclaration",
  "TypeAlias",
]);
function getTypeParametersFromTypeAlias(node) {
  if (isTypeAlias(node)) {
    return node.typeParameters?.params;
  }
}

function hasComplexTypeAnnotation(node) {
  if (node.type !== "VariableDeclarator") {
    return false;
  }
  const { typeAnnotation } = node.id;
  if (!typeAnnotation || !typeAnnotation.typeAnnotation) {
    return false;
  }
  const typeParams = getTypeParametersFromTypeReference(
    typeAnnotation.typeAnnotation,
  );
  return (
    isNonEmptyArray(typeParams) &&
    typeParams.length > 1 &&
    typeParams.some(
      (param) =>
        isNonEmptyArray(getTypeParametersFromTypeReference(param)) ||
        param.type === "TSConditionalType",
    )
  );
}

function isArrowFunctionVariableDeclarator(node) {
  return (
    node.type === "VariableDeclarator" &&
    node.init?.type === "ArrowFunctionExpression"
  );
}

const isTypeReference = createTypeCheckFunction([
  "TSTypeReference",
  "GenericTypeAnnotation",
]);
function getTypeParametersFromTypeReference(node) {
  if (isTypeReference(node)) {
    return node.typeParameters?.params;
  }
}

/**
 * A chain with no calls at all or whose calls are all without arguments or with lone short arguments,
 * excluding chains printed by `printMemberChain`
 */
function isPoorlyBreakableMemberOrCallChain(
  path,
  options,
  print,
  deep = false,
) {
  const { node } = path;
  const goDeeper = () =>
    isPoorlyBreakableMemberOrCallChain(path, options, print, true);

  if (node.type === "ChainExpression" || node.type === "TSNonNullExpression") {
    return path.call(goDeeper, "expression");
  }

  if (isCallExpression(node)) {
    /** @type {any} TODO */
    const doc = printCallExpression(path, options, print);
    if (doc.label?.memberChain) {
      return false;
    }

    const args = getCallArguments(node);
    const isPoorlyBreakableCall =
      args.length === 0 ||
      (args.length === 1 && isLoneShortArgument(args[0], options));
    if (!isPoorlyBreakableCall) {
      return false;
    }

    if (isCallExpressionWithComplexTypeArguments(node, print)) {
      return false;
    }

    return path.call(goDeeper, "callee");
  }

  if (isMemberExpression(node)) {
    return path.call(goDeeper, "object");
  }

  return deep && (node.type === "Identifier" || node.type === "ThisExpression");
}

function isObjectPropertyWithShortKey(node, keyDoc, options) {
  if (!isObjectProperty(node)) {
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

function isCallExpressionWithComplexTypeArguments(node, print) {
  const typeArgs = getTypeArgumentsFromCallExpression(node);
  if (isNonEmptyArray(typeArgs)) {
    if (typeArgs.length > 1) {
      return true;
    }
    if (typeArgs.length === 1) {
      const firstArg = typeArgs[0];
      if (
        isUnionType(firstArg) ||
        isIntersectionType(firstArg) ||
        firstArg.type === "TSTypeLiteral" ||
        firstArg.type === "ObjectTypeAnnotation"
      ) {
        return true;
      }
    }
    const typeArgsKeyName = node.typeParameters
      ? "typeParameters"
      : "typeArguments";
    if (willBreak(print(typeArgsKeyName))) {
      return true;
    }
  }
  return false;
}

function getTypeArgumentsFromCallExpression(node) {
  return (node.typeParameters ?? node.typeArguments)?.params;
}

function shouldBreakBeforeConditionalType(node) {
  function isGeneric(subNode) {
    switch (subNode.type) {
      case "FunctionTypeAnnotation":
      case "GenericTypeAnnotation":
      case "TSFunctionType":
      case "TSTypeReference":
        return Boolean(subNode.typeParameters);
      default:
        return false;
    }
  }

  return isGeneric(node.checkType) || isGeneric(node.extendsType);
}

export {
  isArrowFunctionVariableDeclarator,
  printAssignment,
  printAssignmentExpression,
  printVariableDeclarator,
};
