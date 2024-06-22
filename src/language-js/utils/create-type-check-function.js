/** @typedef {import("../types/estree.js").Node} Node */
/** @typedef {import("../types/estree.js").Comment} Comment */

/**
 * @param {string[]} typesArray
 * @returns {(node: Node | Comment) => Boolean}
 */
function createTypeCheckFunction(typesArray) {
  const types = new Set(typesArray);
  return (node) => types.has(node?.type);
}

export default createTypeCheckFunction;
