import { isMethod } from "./is-method.js";

/**
@import {
  Node,
} from "../types/estree.js";
*/

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isObjectProperty(node) {
  return (
    node?.type === "ObjectProperty" ||
    (node?.type === "Property" && !isMethod(node))
  );
}

export { isObjectProperty };
