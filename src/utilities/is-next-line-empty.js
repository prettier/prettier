import hasNewline from "./has-newline.js";
import { skipSpaces, skipToLineEnd } from "./skip.js";
import skipInlineComment from "./skip-inline-comment.js";
import skipNewline from "./skip-newline.js";
import skipTrailingComment from "./skip-trailing-comment.js";

/**
 * @param {string} text
 * @param {number} startIndex
 * @returns {boolean}
 */
function isNextLineEmpty(text, startIndex) {
  /** @type {number | false} */
  let oldIdx = null;
  /** @type {number | false} */
  let idx = startIndex;
  while (idx !== oldIdx) {
    // We need to skip all the potential trailing inline comments
    oldIdx = idx;
    idx = skipToLineEnd(text, idx);
    idx = skipInlineComment(text, idx);
    idx = skipSpaces(text, idx);
  }
  idx = skipTrailingComment(text, idx);
  idx = skipNewline(text, idx);
  return idx !== false && hasNewline(text, idx);
}

export default isNextLineEmpty;
