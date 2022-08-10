const nonTraversableKeys = new Set([
  "tokens",
  "comments",
  "parent",
  "enclosingNode",
  "precedingNode",
  "followingNode",
]);

const defaultGetVisitorKeys = (node, nonTraversableKeys) =>
  Object.keys(node).filter((key) => !nonTraversableKeys.has(key));

function getVisitorKeys(node, printerGetVisitorKeys = defaultGetVisitorKeys) {
  return printerGetVisitorKeys(node, nonTraversableKeys);
}

export default getVisitorKeys;
