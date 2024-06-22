import { skipSpaces } from "./skip.js";
import skipInlineComment from "./skip-inline-comment.js";
import skipNewline from "./skip-newline.js";
import skipTrailingComment from "./skip-trailing-comment.js";

/**
 * @param {string} text
 * @param {number} startIndex
 * @returns {number | false}
 */
function getNextNonSpaceNonCommentCharacterIndex(text, startIndex) {
  /** @type {number | false} */
  let oldIdx = null;
  /** @type {number | false} */
  let nextIdx = startIndex;
  while (nextIdx !== oldIdx) {
    oldIdx = nextIdx;
    nextIdx = skipSpaces(text, nextIdx);
    nextIdx = skipInlineComment(text, nextIdx);
    nextIdx = skipTrailingComment(text, nextIdx);
    nextIdx = skipNewline(text, nextIdx);
  }
  return nextIdx;
}

export default getNextNonSpaceNonCommentCharacterIndex;
