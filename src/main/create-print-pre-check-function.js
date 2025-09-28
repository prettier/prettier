import noop from "../utils/noop.js";
import createGetVisitorKeysFunction from "./create-get-visitor-keys-function.js";

function createPrintPreCheckFunction(options) {
  // All core plugins have full list of keys for possible child nodes
  // Ensure we only pass node to `print`
  const getVisitorKeys = createGetVisitorKeysFunction(
    options.printer.getVisitorKeys,
  );

  return function (path) {
    if (path.isRoot) {
      return;
    }

    const { key, parent } = path;

    const visitorKeys = getVisitorKeys(parent);
    if (visitorKeys.includes(key)) {
      return;
    }

    /* c8 ignore start */
    throw Object.assign(new Error("Calling `print()` on non-node object."), {
      parentNode: parent,
      allowedProperties: visitorKeys,
      printingProperty: key,
      printingValue: path.node,
      pathStack:
        path.stack.length > 5
          ? ["...", ...path.stack.slice(-5)]
          : [...path.stack],
    });
    /* c8 ignore stop */
  };
}

export default process.env.NODE_ENV === "production"
  ? () => noop
  : createPrintPreCheckFunction;
