import getChildNodes from "./get-child-nodes.js"
import createLocationCompareFunction from "./create-location-compare-function.js"

const cache = new WeakMap();
function getSortedChildNodes(node, options) {
  if (cache.has(node)) {
    return cache.get(node);
  }

  const childNodes = getChildNodes(node, options)

  options.locationCompareFunction ??=
    createLocationCompareFunction(options)
  childNodes.sort(options.locationCompareFunction);

  cache.set(node, childNodes);
  return childNodes
}

export default getSortedChildNodes
