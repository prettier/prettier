// TODO: Move this check to `../main/ast-to-doc.js` after all languages pass it
function createPrintPreCheckFunction(getVisitorKeys) {
  return function (path) {
    let name = path.getName();

    // AST root
    if (name === null) {
      return;
    }

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
    }

    const parent = path.getParentNode();
    const visitorKeys = getVisitorKeys(parent);
    if (visitorKeys.includes(name)) {
      return;
    }

    /* istanbul ignore next */
    throw Object.assign(new Error("Calling `print()` on non-node object."), {
      parentNode: parent,
      allowedProperties: visitorKeys,
      printingProperty: name,
      printingValue: path.getValue(),
    });
  };
}

export default createPrintPreCheckFunction;
