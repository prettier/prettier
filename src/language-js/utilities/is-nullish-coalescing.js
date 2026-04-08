/**
@import {
  Node,
} from "../types/estree.js";
*/

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isNullishCoalescing(node) {
  return node.type === "LogicalExpression" && node.operator === "??";
}

export { isNullishCoalescing };
