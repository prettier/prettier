import {
  isBinaryCastExpression,
  isCallExpression,
  isChainElementWrapper,
  isMemberExpression,
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

export { getLeftSide, getLeftSidePathName, hasNakedLeftSide };
