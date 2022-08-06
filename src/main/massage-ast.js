function massageAST(ast, options) {
  const cleanFunction = options.printer.massageAstNode;

  const ignoredProperties = new Set([
    ...(options.printer.ignoredProperties ?? []),
    ...(cleanFunction?.ignoredProperties ?? []),
  ]);

  return recurse(ast);

  function recurse(node, parent) {
    if (!node || typeof node !== "object") {
      return node;
    }

    if (Array.isArray(node)) {
      const newArray = [];
      for (let i = 0; i < node.length; i++) {
        const item = recurse(node[i], parent);
        if (item) {
          newArray.push(item);
        }
      }
      return newArray;
    }

    const newObj = {};

    for (const key in node) {
      if (
        Object.prototype.hasOwnProperty.call(node, key) &&
        !ignoredProperties.has(key)
      ) {
        newObj[key] = recurse(node[key], node);
      }
    }

    if (cleanFunction) {
      const result = cleanFunction(node, newObj, parent);
      if (result === null) {
        return;
      }
      if (result) {
        return result;
      }
    }

    return newObj;
  }
}

export default massageAST;
