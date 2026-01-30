import { isLineComment } from "./comment-types.js";
import { CommentCheckFlags, getComments } from "./comments.js";

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
  return isLineComment(getComments(node, CommentCheckFlags.Dangling).at(-1));
}

export { needsHardlineAfterDanglingComment };
