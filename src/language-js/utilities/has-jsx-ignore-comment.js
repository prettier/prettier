import { hasNodeIgnoreComment } from "./has-node-ignore-comment.js";
import { isMeaningfulJsxText } from "./is-meaningful-jsx-text.js";
import { isJsxElement } from "./node-types.js";

/**
@import AstPath from "../../common/ast-path.js";
@import {Node} from "../types/estree.js";
*/

/**
 * @param {AstPath} path
 * @returns {boolean}
 */
function hasJsxIgnoreComment(path) {
  const { node, parent } = path;
  if (!isJsxElement(node) || !isJsxElement(parent)) {
    return false;
  }

  // Lookup the previous sibling, ignoring any empty JSXText elements
  const { index, siblings } = path;
  let prevSibling;
  for (let i = index; i > 0; i--) {
    const candidate = siblings[i - 1];
    if (candidate.type === "JSXText" && !isMeaningfulJsxText(candidate)) {
      continue;
    }
    prevSibling = candidate;
    break;
  }

  return (
    prevSibling?.type === "JSXExpressionContainer" &&
    prevSibling.expression.type === "JSXEmptyExpression" &&
    hasNodeIgnoreComment(prevSibling.expression)
  );
}

export { hasJsxIgnoreComment };
