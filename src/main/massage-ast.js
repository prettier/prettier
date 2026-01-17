import isObject from "../utilities/is-object.js";

function massageAst(ast, options) {
  const { printer } = options;
  const clean = printer.massageAstNode;

  if (!clean) {
    return ast;
  }

  const { getVisitorKeys } = printer;
  const { ignoredProperties } = clean;

  return recurse(ast);

  function recurse(original, parent) {
    if (!isObject(original)) {
      return original;
    }

    if (Array.isArray(original)) {
      return original.map((child) => recurse(child, parent)).filter(Boolean);
    }

    const cloned = {};
    const childrenKeys = new Set(getVisitorKeys(original));
    for (const key in original) {
      if (!Object.hasOwn(original, key) || ignoredProperties?.has(key)) {
        continue;
      }

      if (childrenKeys.has(key)) {
        cloned[key] = recurse(original[key], original);
      } else {
        cloned[key] = original[key];
      }
    }

    const result = clean(original, cloned, parent);
    if (result === null) {
      return;
    }

    return result ?? cloned;
  }
}

export default massageAst;
