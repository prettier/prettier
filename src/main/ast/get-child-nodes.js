import isObject from "../../utils/is-object.js"
import createGetVisitorKeysFunction from "./create-get-visitor-keys-function.js"

const childNodesCache = new WeakMap();
function getChildNodes(node, options) {
  if (childNodesCache.has(node)) {
    return childNodesCache.get(node);
  }

  options.getVisitorKeys ??= createGetVisitorKeysFunction(options.printer.getVisitorKeys)

  const childNodes = options.getVisitorKeys(node)
    .flatMap((key) => node[key])
    .filter(isObject);

  childNodesCache.set(node, childNodes);
  return childNodes;
}

export default getChildNodes;
