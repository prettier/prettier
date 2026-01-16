import { skipSpaces } from "./skip.js";
import skipNewline from "./skip-newline.js";

// Note: this function doesn't ignore leading comments unlike isNextLineEmpty
/**
 * @param {string} text
 * @param {number} startIndex
 * @returns {boolean}
 */
function isPreviousLineEmpty(text, startIndex) {
  /** @type {number | false} */
  let idx = startIndex - 1;
  idx = skipSpaces(text, idx, { backwards: true });
  idx = skipNewline(text, idx, { backwards: true });
  idx = skipSpaces(text, idx, { backwards: true });
  const idx2 = skipNewline(text, idx, { backwards: true });
  return idx !== idx2;
}

export default isPreviousLineEmpty;
