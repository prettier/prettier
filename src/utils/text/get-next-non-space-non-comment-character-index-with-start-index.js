import skipInlineComment from "./skip-inline-comment.js";
import skipNewline from "./skip-newline.js";
import skipTrailingComment from "./skip-trailing-comment.js";
import { skipSpaces } from "./skip.js";

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

export default getNextNonSpaceNonCommentCharacterIndexWithStartIndex;
