import { isMemberExpression } from "./node-types.js";

/**
@import {
  Node,
} from "../types/estree.js";
*/

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

export { isMemberish };
