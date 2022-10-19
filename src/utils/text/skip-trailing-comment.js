import { skipEverythingButNewLine } from "./skip.js";

/**
 * @param {string} text
 * @param {number | false} index
 * @returns {number | false}
 */
function skipTrailingComment(text, index) {
  /* c8 ignore next 3 */
  if (index === false) {
    return false;
  }

  if (text.charAt(index) === "/" && text.charAt(index + 1) === "/") {
    return skipEverythingButNewLine(text, index);
  }
  return index;
}

export default skipTrailingComment;
