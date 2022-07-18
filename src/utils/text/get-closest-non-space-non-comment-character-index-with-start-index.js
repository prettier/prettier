"use strict";

/** @typedef {import("./skip").SkipOptions} SkipOptions */

const skipInlineComment = require("./skip-inline-comment.js");
const skipNewline = require("./skip-newline.js");
const skipTrailingComment = require("./skip-trailing-comment.js");
const { skipSpaces } = require("./skip.js");

/**
 * @param {string} text
 * @param {number} idx
 * @param {SkipOptions=} opts
 * @returns {number | false}
 */
function getClosestNonSpaceNonCommentCharacterIndexWithStartIndex(text, idx, opts) {
  /** @type {number | false} */
  let oldIdx = null;
  /** @type {number | false} */
  let nextIdx = idx;
  while (nextIdx !== oldIdx) {
    oldIdx = nextIdx;
    nextIdx = skipSpaces(text, nextIdx, opts);
    nextIdx = skipInlineComment(text, nextIdx, opts);
    nextIdx = skipTrailingComment(text, nextIdx, opts);
    nextIdx = skipNewline(text, nextIdx, opts);
  }
  return nextIdx;
}

module.exports = getClosestNonSpaceNonCommentCharacterIndexWithStartIndex;
