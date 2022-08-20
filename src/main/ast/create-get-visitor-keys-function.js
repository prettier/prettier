const nonTraversableKeys = new Set([
  "tokens",
  "comments",
  "parent",
  "enclosingNode",
  "precedingNode",
  "followingNode",
]);

const defaultGetVisitorKeys = (node) =>
  Object.keys(node).filter((key) => !nonTraversableKeys.has(key));

function createGetVisitorKeysFunction(printerGetVisitorKeys) {
  return printerGetVisitorKeys
    ? (node) => printerGetVisitorKeys(node, nonTraversableKeys)
    : defaultGetVisitorKeys;
}

export default createGetVisitorKeysFunction;
