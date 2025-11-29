import {
  createTypeCheckFunction,
  hasNodeIgnoreComment,
  isJsxElement,
  isUnionType,
} from "../utils/index.js";

const isClassOrInterface = createTypeCheckFunction([
  "ClassDeclaration",
  "ClassExpression",
  "DeclareClass",
  "DeclareInterface",
  "InterfaceDeclaration",
  "TSInterfaceDeclaration",
  // Can't have `id` or `typeParameters`
  // "InterfaceTypeAnnotation",
]);

/**
 * @param {AstPath} path
 * @returns {boolean}
 */
function willPrintOwnComments(path) {
  const { key, parent } = path;
  if (
    (key === "types" && isUnionType(parent)) ||
    (key === "argument" && parent.type === "JSXSpreadAttribute") ||
    (key === "expression" && parent.type === "JSXSpreadChild") ||
    (key === "superClass" &&
      (parent.type === "ClassDeclaration" ||
        parent.type === "ClassExpression")) ||
    ((key === "id" || key === "typeParameters") &&
      isClassOrInterface(parent)) ||
    // Not tested, don't know how to
    (key === "patterns" && parent.type === "MatchOrPattern")
  ) {
    return true;
  }

  const { node } = path;
  if (hasNodeIgnoreComment(node)) {
    return false;
  }

  return isJsxElement(node) || isUnionType(node);
}

export default willPrintOwnComments;
