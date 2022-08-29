import isObject from "../../utils/is-object.js";

function getChildNodes(node, options) {
  return options
    .getVisitorKeys(node)
    .flatMap((key) => node[key])
    .filter(isObject);
}

export default getChildNodes;
