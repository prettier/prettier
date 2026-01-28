import hasNewline from "../../utilities/has-newline.js";
import { locEnd } from "../loc.js";
import { CommentCheckFlags, hasComment } from "./comments.js";
import { hasNodeIgnoreComment } from "./has-node-ignore-comment.js";
import { isJsxElement } from "./node-types.js";

/**
@import {
  Node,
  NodeMap,
  Comment,
  NumericLiteral,
  StringLiteral,
  RegExpLiteral,
  BigIntLiteral,
} from "../types/estree.js";
@import AstPath from "../../common/ast-path.js";
*/

/**
 * @param {string} text
 * @param {Node} node
 * @returns {boolean}
 */
function hasLeadingOwnLineComment(text, node) {
  if (isJsxElement(node)) {
    return hasNodeIgnoreComment(node);
  }

  return hasComment(node, CommentCheckFlags.Leading, (comment) =>
    hasNewline(text, locEnd(comment)),
  );
}

export { hasLeadingOwnLineComment };
