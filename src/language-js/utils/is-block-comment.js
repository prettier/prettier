/**
 * @typedef {import("../types/estree").Comment} Comment
 */

/**
 * @param {Comment} comment
 * @returns {boolean}
 */
function isBlockComment(comment) {
  return (
    comment.type === "Block" ||
    comment.type === "CommentBlock" ||
    // `meriyah`
    comment.type === "MultiLine"
  );
}

export default isBlockComment;
