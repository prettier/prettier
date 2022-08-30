import toFastProperties from "to-fast-properties";

function createGetVisitorKeys(visitorKeys, typeProperty = "type") {
  toFastProperties(visitorKeys);

  function getVisitorKeys(node) {
    const type = node[typeProperty];

    /* istanbul ignore next */
    if (process.env.NODE_ENV !== "production" && typeof type === "undefined") {
      throw new Error(
        `Can't get node type, you must pass the wrong typeProperty '${typeProperty}'`
      );
    }

    const keys = visitorKeys[type];
    /* istanbul ignore next */
    if (!Array.isArray(keys)) {
      throw Object.assign(new Error(`Missing visitor keys for '${type}'.`), {
        node,
      });
    }

    return keys;
  }

  return getVisitorKeys;
}

export default createGetVisitorKeys;
