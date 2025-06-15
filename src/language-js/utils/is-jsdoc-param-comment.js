import isBlockComment from "./is-block-comment.js";

/**
 * @import {Comment} from "../types/estree.js"
 */

/**
 * @param {Comment} comment
 * @returns {boolean}
 */
function isJsdocParamComment(comment) {
  return (
    isBlockComment(comment) &&
    comment.value[0] === "*" &&
    /@param\b/u.test(comment.value)
  );
}

export default isJsdocParamComment;
