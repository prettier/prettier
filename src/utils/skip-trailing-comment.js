import { skipEverythingButNewLine } from "./skip.js";

/**
 * @param {string} text
 * @param {number | false} startIndex
 * @returns {number | false}
 */
function skipTrailingComment(text, startIndex) {
  /* c8 ignore next 3 */
  if (startIndex === false) {
    return false;
  }

  if (text.charAt(startIndex) === "/" && text.charAt(startIndex + 1) === "/") {
    return skipEverythingButNewLine(text, startIndex);
  }
  return startIndex;
}

export default skipTrailingComment;
