const nonTraversableKeys = new Set([
  "tokens",
  "comments",
  "parent",
  "enclosingNode",
  "precedingNode",
  "followingNode",
]);

function getVisitorKeys(node, printerGetVisitorKeys) {
  return (
    printerGetVisitorKeys?.(node) ??
    Object.keys(node).filter((key) => !nonTraversableKeys.has(key))
  );
}

export default getVisitorKeys;
