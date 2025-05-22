/** @import {Node, Comment} from "../types/estree.js" */

/**
 * @param {string[]} typesArray
 * @returns {(node: Node | Comment) => Boolean}
 */
function createTypeCheckFunction(typesArray) {
  const types = new Set(typesArray);
  return (node) => types.has(node?.type);
}

export default createTypeCheckFunction;
