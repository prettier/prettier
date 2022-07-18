"use strict";

/** @typedef {import("./skip").SkipOptions} SkipOptions */

/**
 * @param {string} text
 * @param {number | false} index
 * @param {SkipOptions=} opts
 * @returns {number | false}
 */
function skipInlineComment(text, index, opts) {
  const backwards = opts && opts.backwards;
  /* istanbul ignore next */
  if (index === false) {
    return false;
  }

  if (backwards) {
    if (text.charAt(index) === "/" && text.charAt(index - 1) === "*") {
      for (let i = index - 2; i >= 0; --i) {
        if (text.charAt(i) === "*" && text.charAt(i - 1) === "/") {
          return i - 2;
        }
      }
    }
  } else {
    if (text.charAt(index) === "/" && text.charAt(index + 1) === "*") {
      for (let i = index + 2; i < text.length; ++i) {
        if (text.charAt(i) === "*" && text.charAt(i + 1) === "/") {
          return i + 2;
        }
      }
    }
  }

  return index;
}

module.exports = skipInlineComment;
