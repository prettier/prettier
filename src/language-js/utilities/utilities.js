import { hasDescendant } from "../../utilities/ast.js";
import hasNewline from "../../utilities/has-newline.js";
import isNextLineEmptyAfterIndex from "../../utilities/is-next-line-empty.js";
import isObject from "../../utilities/is-object.js";
import printString from "../../utilities/print-string.js";
import {
  hasSameLoc,
  hasSameLocStart,
  locEnd,
  locEndWithFullText,
  locStart,
} from "../loc.js";
import getVisitorKeys from "../traverse/get-visitor-keys.js";
import { CommentCheckFlags, getComments, hasComment } from "./comments.js";
import { createTypeCheckFunction } from "./create-type-check-function.js";
import getRaw from "./get-raw.js";
import { hasNodeIgnoreComment } from "./has-node-ignore-comment.js";
import isBlockComment from "./is-block-comment.js";
import isFlowKeywordType from "./is-flow-keyword-type.js";
import isTsKeywordType from "./is-ts-keyword-type.js";
import {
  isBinaryCastExpression,
  isCallExpression,
  isChainElementWrapper,
  isIntersectionType,
  isJsxElement,
  isLiteral,
  isMemberExpression,
  isNumericLiteral,
  isStringLiteral,
  isUnionType,
} from "./node-types.js";

/**
@import {
  Node,
  NodeMap,
  Comment,
  NumericLiteral,
  StringLiteral,
  RegExpLiteral,
  BigIntLiteral,
} from "../types/estree.js";
@import AstPath from "../../common/ast-path.js";
*/

/**
 * @param {Node} node
 * @param {(node: Node) => boolean} predicate
 * @returns {boolean}
 */
function hasNode(node, predicate) {
  return predicate(node) || hasDescendant(node, { getVisitorKeys, predicate });
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function hasNakedLeftSide(node) {
  return (
    node.type === "AssignmentExpression" ||
    node.type === "BinaryExpression" ||
    node.type === "LogicalExpression" ||
    node.type === "NGPipeExpression" ||
    node.type === "ConditionalExpression" ||
    isCallExpression(node) ||
    isMemberExpression(node) ||
    node.type === "SequenceExpression" ||
    node.type === "TaggedTemplateExpression" ||
    node.type === "BindExpression" ||
    (node.type === "UpdateExpression" && !node.prefix) ||
    isBinaryCastExpression(node) ||
    isChainElementWrapper(node)
  );
}

function getLeftSide(node) {
  if (node.expressions) {
    return node.expressions[0];
  }
  return (
    node.left ??
    node.test ??
    node.callee ??
    node.object ??
    node.tag ??
    node.argument ??
    node.expression
  );
}

function getLeftSidePathName(node) {
  if (node.expressions) {
    return ["expressions", 0];
  }
  if (node.left) {
    return ["left"];
  }
  if (node.test) {
    return ["test"];
  }
  if (node.object) {
    return ["object"];
  }
  if (node.callee) {
    return ["callee"];
  }
  if (node.tag) {
    return ["tag"];
  }
  if (node.argument) {
    return ["argument"];
  }
  if (node.expression) {
    return ["expression"];
  }
  throw new Error("Unexpected node has no left side.");
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isNullishCoalescing(node) {
  return node.type === "LogicalExpression" && node.operator === "??";
}

/**
@param {Node} node
@returns {node is NodeMap["UnaryExpression"] & {operator: "+" | "-", argument: NumericLiteral}}
*/
function isSignedNumericLiteral(node) {
  return (
    node.type === "UnaryExpression" &&
    (node.operator === "+" || node.operator === "-") &&
    isNumericLiteral(node.argument)
  );
}

function isMethod(node) {
  return (
    (node.method && node.kind === "init") ||
    node.kind === "get" ||
    node.kind === "set"
  );
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isFlowObjectTypePropertyAFunction(node) {
  return (
    (node.type === "ObjectTypeProperty" ||
      node.type === "ObjectTypeInternalSlot") &&
    !node.static &&
    !node.method &&
    // @ts-expect-error -- exists on `ObjectTypeProperty` but not `ObjectTypeInternalSlot`
    node.kind !== "get" &&
    // @ts-expect-error -- exists on `ObjectTypeProperty` but not `ObjectTypeInternalSlot`
    node.kind !== "set" &&
    node.value.type === "FunctionTypeAnnotation"
  );
}

// Hack to differentiate between the following two which have the same ast
// declare function f(a): void;
// var f: (a) => void;
function isTypeAnnotationAFunction(node) {
  return (
    (node.type === "TypeAnnotation" || node.type === "TSTypeAnnotation") &&
    node.typeAnnotation.type === "FunctionTypeAnnotation" &&
    !node.static &&
    !hasSameLocStart(node, node.typeAnnotation)
  );
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isMemberish(node) {
  return (
    isMemberExpression(node) ||
    (node.type === "BindExpression" && Boolean(node.object))
  );
}

const isSimpleTypeAnnotation = createTypeCheckFunction([
  "TSThisType",
  // literals
  "NullLiteralTypeAnnotation",
  "BooleanLiteralTypeAnnotation",
  "StringLiteralTypeAnnotation",
  "BigIntLiteralTypeAnnotation",
  "NumberLiteralTypeAnnotation",
  "TSLiteralType",
  "TSTemplateLiteralType",
]);
/**
 * @param {Node} node
 * @returns {boolean}
 */
function isSimpleType(node) {
  return (
    isTsKeywordType(node) ||
    isFlowKeywordType(node) ||
    isSimpleTypeAnnotation(node) ||
    (node.type === "GenericTypeAnnotation" && !node.typeParameters) ||
    (node.type === "TSTypeReference" && !node.typeArguments)
  );
}

/**
 * Attempts to gauge the rough complexity of a node, for example
 * to detect deeply-nested booleans, call expressions with lots of arguments, etc.
 */
function isSimpleExpressionByNodeCount(node, maxInnerNodeCount = 5) {
  const count = getExpressionInnerNodeCount(node, maxInnerNodeCount);
  return count <= maxInnerNodeCount;
}

function getExpressionInnerNodeCount(node, maxCount) {
  let count = 0;
  for (const k in node) {
    const prop = node[k];

    if (isObject(prop) && typeof prop.type === "string") {
      count++;
      count += getExpressionInnerNodeCount(prop, maxCount - count);
    }

    // Bail early to protect against bad performance.
    if (count > maxCount) {
      return count;
    }
  }
  return count;
}

const LONE_SHORT_ARGUMENT_THRESHOLD_RATE = 0.25;
function isLoneShortArgument(node, options) {
  const { printWidth } = options;

  if (hasComment(node)) {
    return false;
  }

  const threshold = printWidth * LONE_SHORT_ARGUMENT_THRESHOLD_RATE;

  if (
    node.type === "ThisExpression" ||
    (node.type === "Identifier" && node.name.length <= threshold) ||
    (isSignedNumericLiteral(node) && !hasComment(node.argument))
  ) {
    return true;
  }

  const regexpPattern =
    (node.type === "Literal" && "regex" in node && node.regex.pattern) ||
    (node.type === "RegExpLiteral" && node.pattern);

  if (regexpPattern) {
    return regexpPattern.length <= threshold;
  }

  if (isStringLiteral(node)) {
    return printString(getRaw(node), options).length <= threshold;
  }

  if (node.type === "TemplateLiteral") {
    return (
      node.expressions.length === 0 &&
      node.quasis[0].value.raw.length <= threshold &&
      !node.quasis[0].value.raw.includes("\n")
    );
  }

  if (node.type === "UnaryExpression") {
    return isLoneShortArgument(node.argument, { printWidth });
  }

  if (
    node.type === "CallExpression" &&
    node.arguments.length === 0 &&
    node.callee.type === "Identifier"
  ) {
    return node.callee.name.length <= threshold - 2;
  }

  return isLiteral(node);
}

/**
 * @param {string} text
 * @param {Node} node
 * @returns {boolean}
 */
function hasLeadingOwnLineComment(text, node) {
  if (isJsxElement(node)) {
    return hasNodeIgnoreComment(node);
  }

  return hasComment(node, CommentCheckFlags.Leading, (comment) =>
    hasNewline(text, locEnd(comment)),
  );
}

/**
 * @param {NodeMap["TemplateLiteral"]} template
 * @returns {boolean}
 */
function templateLiteralHasNewLines(template) {
  return template.quasis.some((quasi) => quasi.value.raw.includes("\n"));
}

/**
 * @param {NodeMap["TemplateLiteral"] | NodeMap["TaggedTemplateExpression"]} node
 * @param {string} text
 * @returns {boolean}
 */
function isTemplateOnItsOwnLine(node, text) {
  return (
    ((node.type === "TemplateLiteral" && templateLiteralHasNewLines(node)) ||
      (node.type === "TaggedTemplateExpression" &&
        templateLiteralHasNewLines(node.quasi))) &&
    !hasNewline(text, locStart(node), { backwards: true })
  );
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function needsHardlineAfterDanglingComment(node) {
  if (!hasComment(node)) {
    return false;
  }
  const lastDanglingComment = getComments(node, CommentCheckFlags.Dangling).at(
    -1,
  );
  return lastDanglingComment && !isBlockComment(lastDanglingComment);
}

// Logic to determine if a call is a “long curried function call”.
// See https://github.com/prettier/prettier/issues/1420.
//
// `connect(a, b, c)(d)`
// In the above call expression, the second call is the parent node and the
// first call is the current node.
/**
 * @param {AstPath} path
 * @returns {boolean}
 */
function isLongCurriedCallExpression(path) {
  const { node, parent, key } = path;
  return (
    key === "callee" &&
    isCallExpression(node) &&
    isCallExpression(parent) &&
    parent.arguments.length > 0 &&
    node.arguments.length > parent.arguments.length
  );
}

/**
 * @param {any} options
 * @param {("es5" | "all")} [level]
 * @returns {boolean}
 */
function shouldPrintComma(options, level = "es5") {
  return (
    (options.trailingComma === "es5" && level === "es5") ||
    (options.trailingComma === "all" && (level === "all" || level === "es5"))
  );
}

/**
 * Tests if the leftmost node of the expression matches the predicate. E.g.,
 * used to check whether an expression statement needs to be wrapped in extra
 * parentheses because it starts with:
 *
 * - `{`
 * - `function`, `class`, or `do {}`
 * - `let[`
 *
 * Will be overzealous if there already are necessary grouping parentheses.
 *
 * @param {Node} node
 * @param {(leftmostNode: Node) => boolean} predicate
 * @returns {boolean}
 */
function startsWithNoLookaheadToken(node, predicate) {
  switch (node.type) {
    case "BinaryExpression":
    case "LogicalExpression":
    case "AssignmentExpression":
    case "NGPipeExpression":
      return startsWithNoLookaheadToken(node.left, predicate);
    case "MemberExpression":
    case "OptionalMemberExpression":
      return startsWithNoLookaheadToken(node.object, predicate);
    case "TaggedTemplateExpression":
      if (node.tag.type === "FunctionExpression") {
        // IIFEs are always already parenthesized
        return false;
      }
      return startsWithNoLookaheadToken(node.tag, predicate);
    case "CallExpression":
    case "OptionalCallExpression":
      if (node.callee.type === "FunctionExpression") {
        // IIFEs are always already parenthesized
        return false;
      }
      return startsWithNoLookaheadToken(node.callee, predicate);
    case "ConditionalExpression":
      return startsWithNoLookaheadToken(node.test, predicate);
    case "UpdateExpression":
      return (
        !node.prefix && startsWithNoLookaheadToken(node.argument, predicate)
      );
    case "BindExpression":
      return node.object && startsWithNoLookaheadToken(node.object, predicate);
    case "SequenceExpression":
      return startsWithNoLookaheadToken(node.expressions[0], predicate);
    case "ChainExpression":
    case "TSNonNullExpression":
    case "TSSatisfiesExpression":
    case "TSAsExpression":
    case "AsExpression":
    case "AsConstExpression":
    case "SatisfiesExpression":
      return startsWithNoLookaheadToken(node.expression, predicate);
    default:
      return predicate(node);
  }
}

const equalityOperators = {
  "==": true,
  "!=": true,
  "===": true,
  "!==": true,
};
const multiplicativeOperators = {
  "*": true,
  "/": true,
  "%": true,
};
const bitshiftOperators = {
  ">>": true,
  ">>>": true,
  "<<": true,
};

function shouldFlatten(parentOp, nodeOp) {
  if (getPrecedence(nodeOp) !== getPrecedence(parentOp)) {
    return false;
  }

  // ** is right-associative
  // x ** y ** z --> x ** (y ** z)
  if (parentOp === "**") {
    return false;
  }

  // x == y == z --> (x == y) == z
  if (equalityOperators[parentOp] && equalityOperators[nodeOp]) {
    return false;
  }

  // x * y % z --> (x * y) % z
  if (
    (nodeOp === "%" && multiplicativeOperators[parentOp]) ||
    (parentOp === "%" && multiplicativeOperators[nodeOp])
  ) {
    return false;
  }

  // x * y / z --> (x * y) / z
  // x / y * z --> (x / y) * z
  if (
    nodeOp !== parentOp &&
    multiplicativeOperators[nodeOp] &&
    multiplicativeOperators[parentOp]
  ) {
    return false;
  }

  // x << y << z --> (x << y) << z
  if (bitshiftOperators[parentOp] && bitshiftOperators[nodeOp]) {
    return false;
  }

  return true;
}

const PRECEDENCE = new Map(
  [
    ["|>"],
    ["??"],
    ["||"],
    ["&&"],
    ["|"],
    ["^"],
    ["&"],
    ["==", "===", "!=", "!=="],
    ["<", ">", "<=", ">=", "in", "instanceof"],
    [">>", "<<", ">>>"],
    ["+", "-"],
    ["*", "/", "%"],
    ["**"],
  ].flatMap((operators, index) =>
    operators.map((operator) => [operator, index]),
  ),
);
function getPrecedence(operator) {
  return PRECEDENCE.get(operator);
}

function isBitwiseOperator(operator) {
  return (
    Boolean(bitshiftOperators[operator]) ||
    operator === "|" ||
    operator === "^" ||
    operator === "&"
  );
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
const isNextLineEmpty = (node, { originalText }) => {
  const end = locEnd(node);

  if (isNextLineEmptyAfterIndex(originalText, end)) {
    return true;
  }

  const endWithSemicolon = locEndWithFullText(node);
  if (endWithSemicolon === end) {
    return false;
  }

  return isNextLineEmptyAfterIndex(originalText, endWithSemicolon);
};

function isObjectProperty(node) {
  return (
    node &&
    (node.type === "ObjectProperty" ||
      (node.type === "Property" && !isMethod(node)))
  );
}

const isTsAsConstExpression = (node) =>
  node?.type === "TSAsExpression" &&
  node.typeAnnotation.type === "TSTypeReference" &&
  node.typeAnnotation.typeName.type === "Identifier" &&
  node.typeAnnotation.typeName.name === "const";

function shouldUnionTypePrintOwnComments({ key, parent }) {
  if (
    // If it's `types` of union type, parent will print comment for it
    (key === "types" && isUnionType(parent)) ||
    // Inside intersection type let the comment print outside of parentheses
    (key === "types" && isIntersectionType(parent))
  ) {
    return false;
  }

  return true;
}

/**
@returns {boolean}
*/
function isBooleanTypeCoercion(node) {
  return (
    node.type === "CallExpression" &&
    !node.optional &&
    node.arguments.length === 1 &&
    node.callee.type === "Identifier" &&
    node.callee.name === "Boolean"
  );
}

function isShorthandSpecifier(specifier) {
  if (
    specifier.type !== "ImportSpecifier" &&
    specifier.type !== "ExportSpecifier"
  ) {
    return false;
  }

  const {
    local,
    [specifier.type === "ImportSpecifier" ? "imported" : "exported"]:
      importedOrExported,
  } = specifier;

  if (
    local.type !== importedOrExported.type ||
    !hasSameLoc(local, importedOrExported)
  ) {
    return false;
  }

  if (isStringLiteral(local)) {
    return (
      local.value === importedOrExported.value &&
      getRaw(local) === getRaw(importedOrExported)
    );
  }

  switch (local.type) {
    case "Identifier":
      return local.name === importedOrExported.name;
    default:
      /* c8 ignore next */
      return false;
  }
}

function isIifeCalleeOrTaggedTemplateExpressionTag(path) {
  const { node } = path;
  return (
    (node.type === "FunctionExpression" ||
      node.type === "ArrowFunctionExpression") &&
    ((path.key === "callee" && isCallExpression(path.parent)) ||
      (path.key === "tag" && path.parent.type === "TaggedTemplateExpression"))
  );
}

export {
  getLeftSide,
  getLeftSidePathName,
  getPrecedence,
  hasLeadingOwnLineComment,
  hasNakedLeftSide,
  hasNode,
  isBitwiseOperator,
  isBooleanTypeCoercion,
  isFlowObjectTypePropertyAFunction,
  isIifeCalleeOrTaggedTemplateExpressionTag,
  isLoneShortArgument,
  isLongCurriedCallExpression,
  isMemberish,
  isMethod,
  isNextLineEmpty,
  isNullishCoalescing,
  isObjectProperty,
  isShorthandSpecifier,
  isSignedNumericLiteral,
  isSimpleExpressionByNodeCount,
  isSimpleType,
  isTemplateOnItsOwnLine,
  isTsAsConstExpression,
  isTypeAnnotationAFunction,
  needsHardlineAfterDanglingComment,
  shouldFlatten,
  shouldPrintComma,
  shouldUnionTypePrintOwnComments,
  startsWithNoLookaheadToken,
};
