import createGetVisitorKeysFunction from "./create-get-visitor-keys-function.js";

function createPrintPreCheckFunction(options) {
  if (process.env.NODE_ENV === "production") {
    return () => {};
  }

  // All core plugins have full list of keys for possible child nodes
  // Ensure we only pass node to `print`
  const getVisitorKeys = createGetVisitorKeysFunction(
    options.printer.getVisitorKeys
  );

  return function (path) {
    let name = path.getName();

    // AST root
    if (name === null) {
      return;
    }

    let parentNode;
    if (typeof name === "number") {
      /*
      Nodes in array are stored in path.stack like

      ```js
      [
        parentNode,
        property, // <-
        array,
        index,
        node,
      ]
      ```
      */
      name = path.stack[path.stack.length - 4];
      parentNode = path.stack[path.stack.length - 5];
    } else {
      // `path.getParentNode()` skips falsely value
      parentNode = path.stack[path.stack.length - 3];
    }

    const visitorKeys = getVisitorKeys(parentNode);
    if (visitorKeys.includes(name)) {
      return;
    }

    /* istanbul ignore next */
    throw Object.assign(new Error("Calling `print()` on non-node object."), {
      parentNode,
      allowedProperties: visitorKeys,
      printingProperty: name,
      printingValue: path.getValue(),
      pathStack:
        path.stack.length > 5
          ? ["...", ...path.stack.slice(-5)]
          : [...path.stack],
    });
  };
}

export default createPrintPreCheckFunction;
