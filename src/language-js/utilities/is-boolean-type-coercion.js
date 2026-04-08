/**
@import {
  Node,
} from "../types/estree.js";
*/

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isBooleanTypeCoercion(node) {
  return (
    node.type === "CallExpression" &&
    // @ts-expect-error -- expected
    !node.optional &&
    node.arguments.length === 1 &&
    node.callee.type === "Identifier" &&
    node.callee.name === "Boolean"
  );
}

export { isBooleanTypeCoercion };
