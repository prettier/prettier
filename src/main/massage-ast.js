import getVisitorKeysWrapper from "./get-visitor-keys.js";

function massageAST(ast, options) {
  const {
    printer: {
      massageAstNode: cleanFunction,
      getVisitorKeys: printerGetVisitorKeys,
    },
  } = options;

  if (!cleanFunction) {
    return ast;
  }

  const getVisitorKeys = (node) =>
    getVisitorKeysWrapper(node, printerGetVisitorKeys);
  const ignoredProperties = cleanFunction.ignoredProperties ?? new Set();

  return recurse(ast);

  function recurse(node, parent) {
    if (!(node !== null && typeof node === "object")) {
      return node;
    }

    if (Array.isArray(node)) {
      return node.map((child) => recurse(child, parent)).filter(Boolean);
    }

    const newObj = {};
    const childrenKeys = new Set(getVisitorKeys(node));
    for (const key in node) {
      if (
        !Object.prototype.hasOwnProperty.call(node, key) ||
        ignoredProperties.has(key)
      ) {
        continue;
      }

      if (childrenKeys.has(key)) {
        newObj[key] = recurse(node[key], node);
      } else {
        newObj[key] = node[key];
      }
    }

    const result = cleanFunction(node, newObj, parent);
    if (result === null) {
      return;
    }

    return result ?? newObj;
  }
}

export default massageAST;
