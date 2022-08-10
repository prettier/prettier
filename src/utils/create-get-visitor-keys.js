import toFastProperties from "to-fast-properties";

function createGetVisitorKeys(visitorKeys, typeProperty = "type") {
  toFastProperties(visitorKeys);

  function getVisitorKeys(node) {
    const type = node[typeProperty];

    if (process.env.NODE_ENV !== "production" && typeof type === "undefined") {
      throw new Error(
        `Can't get node type, you must pass the wrong typeProperty '${typeProperty}'`
      );
    }

    const keys = visitorKeys[type];
    if (process.env.NODE_ENV !== "production" && !Array.isArray(keys)) {
      throw Object.assign(new Error(`Missing visitor keys for '${type}'.`), {
        node,
      });
    }

    return keys;
  }

  // Core plugins all have full list of visitor keys
  getVisitorKeys.disableFallback = true;

  return getVisitorKeys;
}

export default createGetVisitorKeys;
