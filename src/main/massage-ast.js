import isObject from "../utils/is-object.js";
import createGetVisitorKeysFunction from "./create-get-visitor-keys-function.js";
import { cleanFrontMatter } from "./front-matter/index.js";

function massageAst(ast, options) {
  const { printer } = options;
  const cleanFunction = printer.massageAstNode;

  if (!cleanFunction) {
    return ast;
  }

  const getVisitorKeys =
    options.getVisitorKeys ??
    createGetVisitorKeysFunction(printer.getVisitorKeys);
  const { ignoredProperties } = cleanFunction;
  const shouldCleanFrontMatter =
    printer.experimentalFeatures.frontMatterSupport.clean;

  const clean = shouldCleanFrontMatter
    ? (original, cloned, parent) => {
        cloned = cleanFrontMatter(original, cloned);
        return cleanFunction(original, cloned, parent);
      }
    : cleanFunction;

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
