/**
 * @param {string} description
 * @returns {(node: any) => symbol}
 */
function createGroupIdMapper(description) {
  const groupIds = new WeakMap();
  return function (node) {
    if (!groupIds.has(node)) {
      groupIds.set(node, Symbol(description));
    }
    return groupIds.get(node);
  };
}

export default createGroupIdMapper;
