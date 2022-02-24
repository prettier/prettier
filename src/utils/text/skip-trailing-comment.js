"use strict";

const { skipEverythingButNewLine } = require("./skip.js");

/**
 * @param {string} text
 * @param {number | false} index
 * @returns {number | false}
 */
function skipTrailingComment(text, index) {
  /* istanbul ignore next */
  if (index === false) {
    return false;
  }

  if (text.charAt(index) === "/" && text.charAt(index + 1) === "/") {
    return skipEverythingButNewLine(text, index);
  }
  return index;
}

module.exports = skipTrailingComment;
