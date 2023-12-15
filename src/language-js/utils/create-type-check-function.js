/** @typedef {import("../types/estree.js").Node} Node */

/**
 * @param {Node["type"][]} types
 * @returns {(node: Node) => Boolean}
 */
function createTypeCheckFunction(types) {
  types = new Set(types);
  return (node) => types.has(node?.type);
}

export default createTypeCheckFunction;
