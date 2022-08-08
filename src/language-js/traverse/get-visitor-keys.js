import visitorKeys from "./visitor-keys.evaluate.js";

function getVisitorKeys(node) {
  const keys = visitorKeys[node.type];

  if (process.env.NODE_ENV !== "production" && !Array.isArray(keys)) {
    throw Object.assign(new Error(`Missing visitor keys for '${node.type}'.`), {
      node,
    });
  }

  return keys;
}

export default getVisitorKeys;
