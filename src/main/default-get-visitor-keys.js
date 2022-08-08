const nonTraversableKeys = new Set(["tokens", "comments", "parent"]);

function getVisitorKeys(node) {
  return Object.keys(node).filter((key) => !nonTraversableKeys.has(key));
}

export default getVisitorKeys;
