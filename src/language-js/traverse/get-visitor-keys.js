import visitorKeys from "./visitor-keys.evaluate.js";

function getVisitorKeys(node) {
  return visitorKeys[node.type]
}

export default getVisitorKeys;
