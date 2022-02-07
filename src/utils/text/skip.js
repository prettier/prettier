"use strict";

/**
 * @typedef {{backwards?: boolean}} SkipOptions
 */

/**
 * @param {string | RegExp} chars
 * @returns {(text: string, index: number | false, opts?: SkipOptions) => number | false}
 */
function skip(chars) {
  return (text, index, opts) => {
    const backwards = opts && opts.backwards;

    // Allow `skip` functions to be threaded together without having
    // to check for failures (did someone say monads?).
    /* istanbul ignore next */
    if (index === false) {
      return false;
    }

    const { length } = text;
    let cursor = index;
    while (cursor >= 0 && cursor < length) {
      const c = text.charAt(cursor);
      if (chars instanceof RegExp) {
        if (!chars.test(c)) {
          return cursor;
        }
      } else if (!chars.includes(c)) {
        return cursor;
      }

      backwards ? cursor-- : cursor++;
    }

    if (cursor === -1 || cursor === length) {
      // If we reached the beginning or end of the file, return the
      // out-of-bounds cursor. It's up to the caller to handle this
      // correctly. We don't want to indicate `false` though if it
      // actually skipped valid characters.
      return cursor;
    }
    return false;
  };
}

/**
 * @type {(text: string, index: number | false, opts?: SkipOptions) => number | false}
 */
const skipWhitespace = skip(/\s/);
/**
 * @type {(text: string, index: number | false, opts?: SkipOptions) => number | false}
 */
const skipSpaces = skip(" \t");
/**
 * @type {(text: string, index: number | false, opts?: SkipOptions) => number | false}
 */
const skipToLineEnd = skip(",; \t");
/**
 * @type {(text: string, index: number | false, opts?: SkipOptions) => number | false}
 */
const skipEverythingButNewLine = skip(/[^\n\r]/);

module.exports = {
  skipWhitespace,
  skipSpaces,
  skipToLineEnd,
  skipEverythingButNewLine,
};
