/**
 * @param {string} text
 * @param {number | false} startIndex
 * @returns {number | false}
 */
function skipInlineComment(text, startIndex) {
  /* c8 ignore next 3 */
  if (startIndex === false) {
    return false;
  }

  if (text.charAt(startIndex) === "/" && text.charAt(startIndex + 1) === "*") {
    for (let i = startIndex + 2; i < text.length; ++i) {
      if (text.charAt(i) === "*" && text.charAt(i + 1) === "/") {
        return i + 2;
      }
    }
  }
  return startIndex;
}

export default skipInlineComment;
