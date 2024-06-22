import createGetVisitorKeysFunction from "./create-get-visitor-keys-function.js";

function massageAst(ast, options) {
  const {
    printer: {
      massageAstNode: cleanFunction,
      getVisitorKeys: printerGetVisitorKeys,
    },
  } = options;

  if (!cleanFunction) {
    return ast;
  }

  const getVisitorKeys = createGetVisitorKeysFunction(printerGetVisitorKeys);
  const ignoredProperties = cleanFunction.ignoredProperties ?? new Set();

  return recurse(ast);

  function recurse(original, parent) {
    if (!(original !== null && typeof original === "object")) {
      return original;
    }

    if (Array.isArray(original)) {
      return original.map((child) => recurse(child, parent)).filter(Boolean);
    }

    const cloned = {};
    const childrenKeys = new Set(getVisitorKeys(original));
    for (const key in original) {
      if (!Object.hasOwn(original, key) || ignoredProperties.has(key)) {
        continue;
      }

      if (childrenKeys.has(key)) {
        cloned[key] = recurse(original[key], original);
      } else {
        cloned[key] = original[key];
      }
    }

    const result = cleanFunction(original, cloned, parent);
    if (result === null) {
      return;
    }

    return result ?? cloned;
  }
}

export default massageAst;
