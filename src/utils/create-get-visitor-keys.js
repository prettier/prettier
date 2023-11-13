import toFastProperties from "to-fast-properties";

function createGetVisitorKeys(visitorKeys, typeProperty = "type") {
  toFastProperties(visitorKeys);

  function getVisitorKeys(node) {
    const type = node[typeProperty];

    /* c8 ignore next 5 */
    if (type === undefined && process.env.NODE_ENV !== "production") {
      throw new Error(
        `Can't get node type, you must pass the wrong typeProperty '${typeProperty}'`,
      );
    }

    const keys = visitorKeys[type];
    /* c8 ignore next 5 */
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
