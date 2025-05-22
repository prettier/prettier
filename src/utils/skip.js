/**
 * @typedef {{backwards?: boolean}} SkipOptions
 */

/**
 * @param {string | RegExp} characters
 * @returns {(text: string, startIndex: number | false, options?: SkipOptions) => number | false}
 */
function skip(characters) {
  return (text, startIndex, options) => {
    const backwards = Boolean(options?.backwards);

    // Allow `skip` functions to be threaded together without having
    // to check for failures (did someone say monads?).
    /* c8 ignore next 3 */
    if (startIndex === false) {
      return false;
    }

    const { length } = text;
    let cursor = startIndex;
    while (cursor >= 0 && cursor < length) {
      const character = text.charAt(cursor);
      if (characters instanceof RegExp) {
        if (!characters.test(character)) {
          return cursor;
        }
      } else if (!characters.includes(character)) {
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
 * @type {(text: string, startIndex: number | false, options?: SkipOptions) => number | false}
 */
const skipWhitespace = skip(/\s/u);
/**
 * @type {(text: string, startIndex: number | false, options?: SkipOptions) => number | false}
 */
const skipSpaces = skip(" \t");
/**
 * @type {(text: string, startIndex: number | false, options?: SkipOptions) => number | false}
 */
const skipToLineEnd = skip(",; \t");
/**
 * @type {(text: string, startIndex: number | false, options?: SkipOptions) => number | false}
 */
const skipEverythingButNewLine = skip(/[^\n\r]/u);

export {
  skip,
  skipEverythingButNewLine,
  skipSpaces,
  skipToLineEnd,
  skipWhitespace,
};
