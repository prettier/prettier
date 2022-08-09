import toFastProperties from "to-fast-properties";
import visitorKeys from "./visitor-keys.evaluate.js";

toFastProperties(visitorKeys);

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
