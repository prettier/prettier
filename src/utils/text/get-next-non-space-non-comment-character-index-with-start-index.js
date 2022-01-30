"use strict";

const skipInlineComment = require("./skip-inline-comment.js");
const skipNewline = require("./skip-newline.js");
const skipTrailingComment = require("./skip-trailing-comment.js");
const { skipSpaces } = require("./skip.js");

/**
 * @param {string} text
 * @param {number} idx
 * @returns {number | false}
 */
function getNextNonSpaceNonCommentCharacterIndexWithStartIndex(text, idx) {
  /** @type {number | false} */
  let oldIdx = null;
  /** @type {number | false} */
  let nextIdx = idx;
  while (nextIdx !== oldIdx) {
    oldIdx = nextIdx;
    nextIdx = skipSpaces(text, nextIdx);
    nextIdx = skipInlineComment(text, nextIdx);
    nextIdx = skipTrailingComment(text, nextIdx);
    nextIdx = skipNewline(text, nextIdx);
  }
  return nextIdx;
}

module.exports = getNextNonSpaceNonCommentCharacterIndexWithStartIndex;
