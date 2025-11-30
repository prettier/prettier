import { skipSpaces } from "./skip.js";
import skipNewline from "./skip-newline.js";

/** @import {SkipOptions} from "./skip.js" */

/**
 * @param {string} text
 * @param {number} startIndex
 * @param {SkipOptions=} options
 * @returns {boolean}
 */
function hasNewline(text, startIndex, options = {}) {
  const idx = skipSpaces(
    text,
    options.backwards ? startIndex - 1 : startIndex,
    options,
  );
  const idx2 = skipNewline(text, idx, options);
  return idx !== idx2;
}

export default hasNewline;
