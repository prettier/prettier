/** @import {SkipOptions} from "./skip.js" */

// This one doesn't use the above helper function because it wants to
// test \r\n in order and `skip` doesn't support ordering and we only
// want to skip one newline. It's simple to implement.
/**
 * @param {string} text
 * @param {number | false} startIndex
 * @param {SkipOptions=} options
 * @returns {number | false}
 */
function skipNewline(text, startIndex, options) {
  const backwards = Boolean(options?.backwards);
  if (startIndex === false) {
    return false;
  }

  const character = text.charAt(startIndex);
  if (backwards) {
    // We already replace `\r\n` with `\n` before parsing
    /* c8 ignore next 3 */
    if (text.charAt(startIndex - 1) === "\r" && character === "\n") {
      return startIndex - 2;
    }
    if (
      character === "\n" ||
      character === "\r" ||
      character === "\u2028" ||
      character === "\u2029"
    ) {
      return startIndex - 1;
    }
  } else {
    // We already replace `\r\n` with `\n` before parsing
    /* c8 ignore next 3 */
    if (character === "\r" && text.charAt(startIndex + 1) === "\n") {
      return startIndex + 2;
    }
    if (
      character === "\n" ||
      character === "\r" ||
      character === "\u2028" ||
      character === "\u2029"
    ) {
      return startIndex + 1;
    }
  }

  return startIndex;
}

export default skipNewline;
