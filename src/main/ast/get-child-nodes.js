import isObject from "../../utils/is-object.js"
import createGetVisitorKeysFunction from "./create-get-visitor-keys-function.js"

function getChildNodes(node, options) {
  options.getVisitorKeys ??= createGetVisitorKeysFunction(options.printer.getVisitorKeys)

  const childNodes = options.getVisitorKeys(node)
    .flatMap((key) => node[key])
    .filter(isObject);

  return childNodes;
}

export default getChildNodes;
