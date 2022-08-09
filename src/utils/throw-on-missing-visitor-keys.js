function throwOnMissingVisitorKeys(fn) {
  return process.env.NODE_ENV === "production"
    ? fn
    : function (node) {
        const keys = fn(node);
        if (!Array.isArray(keys)) {
          throw Object.assign(
            new Error(`Missing visitor keys for '${node.type}'.`),
            {
              node,
            }
          );
        }

        return keys;
      };
}

export default throwOnMissingVisitorKeys;
