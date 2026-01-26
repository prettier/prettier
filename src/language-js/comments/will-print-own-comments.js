import { shouldExpressionStatementPrintLeadingSemicolon } from "../semicolon/semicolon.js";
import {
  createTypeCheckFunction,
  hasNodeIgnoreComment,
  isIifeCalleeOrTaggedTemplateExpressionTag,
  shouldUnionTypePrintOwnComments,
} from "../utilities/index.js";
import { isJsxElement, isUnionType } from "../utilities/node-types.js";

/**
@import {Node} from "../types/estree.js";
@import AstPath from "../../common/ast-path.js";
*/

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
function willPrintOwnComments(path, options) {
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
    (key === "patterns" && parent.type === "MatchOrPattern") ||
    isIifeCalleeOrTaggedTemplateExpressionTag(path)
  ) {
    return true;
  }

  const { node } = path;

  if (hasNodeIgnoreComment(node)) {
    return false;
  }

  if (node.type === "ExpressionStatement") {
    return shouldExpressionStatementPrintLeadingSemicolon(path, options);
  }

  if (isUnionType(node)) {
    return shouldUnionTypePrintOwnComments(path);
  }

  if (isJsxElement(node)) {
    return true;
  }

  return false;
}

export default willPrintOwnComments;
