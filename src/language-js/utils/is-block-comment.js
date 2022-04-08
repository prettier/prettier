"use strict";

/**
 * @typedef {import("../types/estree").Comment} Comment
 */

const BLOCK_COMMENT_TYPES = new Set([
  "Block",
  "CommentBlock",
  // `meriyah`
  "MultiLine",
]);
/**
 * @param {Comment} comment
 * @returns {boolean}
 */
const isBlockComment = (comment) => BLOCK_COMMENT_TYPES.has(comment?.type);

module.exports = isBlockComment;
