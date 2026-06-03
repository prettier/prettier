import { getOrInsertComputed } from "./get-or-insert.js";

/**
 * @param {string} description
 * @returns {(node: any) => symbol}
 */
function createGroupIdMapper(description) {
  const groupIds = new WeakMap();
  return (node) =>
    getOrInsertComputed(groupIds, node, () => Symbol(description));
}

export default createGroupIdMapper;
