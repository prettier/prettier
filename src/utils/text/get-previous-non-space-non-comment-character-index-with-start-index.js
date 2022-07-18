"use strict";

const getClosestNonSpaceNonCommentCharacterIndexWithStartIndex = require("./get-closest-non-space-non-comment-character-index-with-start-index.js");

/**
 * @param {string} text
 * @param {number} idx
 * @returns {number | false}
 */
function getPreviousNonSpaceNonCommentCharacterIndexWithStartIndex(text, idx) {
  return getClosestNonSpaceNonCommentCharacterIndexWithStartIndex(text, idx, { backwards: true });
}

module.exports = getPreviousNonSpaceNonCommentCharacterIndexWithStartIndex;
