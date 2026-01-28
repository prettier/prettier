import getStringWidth from "../../utilities/get-string-width.js";
import { getCallArguments } from "./call-arguments.js";
import { createTypeCheckFunction } from "./create-type-check-function.js";
import {
  isArrayExpression,
  isCallLikeExpression,
  isLiteral,
  isMemberExpression,
  isObjectExpression,
  isRegExpLiteral,
} from "./node-types.js";
import { stripChainElementWrappers } from "./strip-chain-element-wrappers.js";

/**
@import {
  Node,
  NodeMap,
} from "../types/estree.js";
*/

const simpleCallArgumentUnaryOperators = new Set(["!", "-", "+", "~"]);

const isSingleWordType = createTypeCheckFunction([
  "Identifier",
  "ThisExpression",
  "Super",
  "PrivateName",
  "PrivateIdentifier",
]);

/**
 * @param {any} node
 * @param {number} depth
 * @returns {boolean}
 */
function isSimpleCallArgument(node, depth = 2) {
  if (depth <= 0) {
    return false;
  }

  const isChildSimple = (child) => isSimpleCallArgument(child, depth - 1);

  node = stripChainElementWrappers(node);

  if (isRegExpLiteral(node)) {
    return (
      // @ts-expect-error -- safe
      getStringWidth(node.pattern ?? node.regex.pattern) <= 5
    );
  }

  if (
    isLiteral(node) ||
    isSingleWordType(node) ||
    node.type === "ArgumentPlaceholder"
  ) {
    return true;
  }

  if (node.type === "TemplateLiteral") {
    return (
      node.quasis.every((element) => !element.value.raw.includes("\n")) &&
      node.expressions.every(isChildSimple)
    );
  }

  if (isObjectExpression(node)) {
    return node.properties.every(
      (property) =>
        // @ts-expect-error -- FIXME
        !property.computed &&
        // @ts-expect-error -- FIXME
        (property.shorthand ||
          // @ts-expect-error -- FIXME
          (property.value && isChildSimple(property.value))),
    );
  }

  if (isArrayExpression(node)) {
    return node.elements.every((x) => x === null || isChildSimple(x));
  }

  if (isCallLikeExpression(node)) {
    if (
      node.type === "ImportExpression" ||
      isSimpleCallArgument(node.callee, depth)
    ) {
      const args = getCallArguments(node);
      return args.length <= depth && args.every(isChildSimple);
    }
    return false;
  }

  if (isMemberExpression(node)) {
    return (
      isSimpleCallArgument(node.object, depth) &&
      isSimpleCallArgument(node.property, depth)
    );
  }

  if (
    (node.type === "UnaryExpression" &&
      simpleCallArgumentUnaryOperators.has(node.operator)) ||
    node.type === "UpdateExpression"
  ) {
    return isSimpleCallArgument(node.argument, depth);
  }

  return false;
}

export { isSimpleCallArgument };
