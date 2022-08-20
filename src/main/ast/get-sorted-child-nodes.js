import getChildNodes from "./get-child-nodes.js";

const cache = new WeakMap();
function getSortedChildNodes(node, options) {
  if (cache.has(node)) {
    return cache.get(node);
  }

  const childNodes = getChildNodes(node, options).sort(
    options.locationCompareFunction
  );

  cache.set(node, childNodes);
  return childNodes;
}

export default getSortedChildNodes;
