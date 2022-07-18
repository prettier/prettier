"use strict";

/** @typedef {import("./skip").SkipOptions} SkipOptions */

const { skipEverythingButNewLine } = require("./skip.js");

/**
 * @param {string} text
 * @param {number | false} index
 * @param {SkipOptions=} opts
 * @returns {number | false}
 */
function skipTrailingComment(text, index, opts) {
  const backwards = opts && opts.backwards;
  /* istanbul ignore next */
  if (index === false) {
    return false;
  }

  if (text.charAt(index) === "/" && text.charAt(index + (backwards ? -1 : 1)) === "/") {
    return skipEverythingButNewLine(text, index);
  }
  return index;
}

module.exports = skipTrailingComment;
