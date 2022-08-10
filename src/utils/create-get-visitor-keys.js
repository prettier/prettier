import toFastProperties from "to-fast-properties";

function createGetVisitorKeys(visitorKeys, typeProperty = "type") {
  toFastProperties(visitorKeys);

  return (node) => {
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
  };
}

export default createGetVisitorKeys;
