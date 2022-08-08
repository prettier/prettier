import visitorKeys from "./visitor-keys.evaluate.js";

function getVisitorKeys(node) {
  const keys = visitorKeys[node.type];

  if (!Array.isArray(keys) && process.env.NODE_ENV !== "production") {
    throw new Error(`Missing visitor keys for '${node.type}'.`)
  }

  return keys
}

export default getVisitorKeys;
