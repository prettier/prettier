"use strict";

/**
 * @param {string} text
 * @param {number | false} index
 * @returns {number | false}
 */
function skipInlineComment(text, index) {
  /* istanbul ignore next */
  if (index === false) {
    return false;
  }

  if (text.charAt(index) === "/" && text.charAt(index + 1) === "*") {
    for (let i = index + 2; i < text.length; ++i) {
      if (text.charAt(i) === "*" && text.charAt(i + 1) === "/") {
        return i + 2;
      }
    }
  }
  return index;
}

module.exports = skipInlineComment;
