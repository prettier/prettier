import { CommentCheckFlags, getComments, hasComment } from "./comments.js";
import { isBlockComment } from "./is-block-comment.js";

/**
@import {
  Node,
} from "../types/estree.js";
*/

/**
 * @param {Node} node
 * @returns {boolean}
 */
function needsHardlineAfterDanglingComment(node) {
  if (!hasComment(node)) {
    return false;
  }
  const lastDanglingComment = getComments(node, CommentCheckFlags.Dangling).at(
    -1,
  );
  return lastDanglingComment && !isBlockComment(lastDanglingComment);
}

export { needsHardlineAfterDanglingComment };
