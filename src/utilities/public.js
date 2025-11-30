import getNextNonSpaceNonCommentCharacterIndexWithStartIndex from "./get-next-non-space-non-comment-character-index.js";
import isNextLineEmptyAfterIndex from "./is-next-line-empty.js";
import isPreviousLineEmptyWithStartIndex from "./is-previous-line-empty.js";

/** @import {Quote} from "./get-preferred-quote.js" */

// Legacy version of `getNextNonSpaceNonCommentCharacterIndex`
/**
 * @template N
 * @param {string} text
 * @param {N} node
 * @param {(node: N) => number} locEnd
 * @returns {number | false}
 */
function legacyGetNextNonSpaceNonCommentCharacterIndex(text, node, locEnd) {
  return getNextNonSpaceNonCommentCharacterIndexWithStartIndex(
    text,
    locEnd(node),
  );
}

// TODO: export `getNextNonSpaceNonCommentCharacterIndex` directly in v4
/**
 * @param {string} text
 * @param {number} startIndex
 * @returns {number | false}
 */
export function getNextNonSpaceNonCommentCharacterIndex(text, startIndex) {
  return arguments.length === 2 || typeof startIndex === "number"
    ? getNextNonSpaceNonCommentCharacterIndexWithStartIndex(text, startIndex)
    : // @ts-expect-error -- expected
      // eslint-disable-next-line prefer-rest-params
      legacyGetNextNonSpaceNonCommentCharacterIndex(...arguments);
}

// Legacy version of `isPreviousLineEmpty`
/**
 * @template N
 * @param {string} text
 * @param {N} node
 * @param {(node: N) => number} locStart
 */
function legacyIsPreviousLineEmpty(text, node, locStart) {
  return isPreviousLineEmptyWithStartIndex(text, locStart(node));
}

// TODO: export `isPreviousLineEmpty` directly in v4
/**
 * @param {string} text
 * @param {number} startIndex
 * @returns {boolean}
 */
export function isPreviousLineEmpty(text, startIndex) {
  return arguments.length === 2 || typeof startIndex === "number"
    ? isPreviousLineEmptyWithStartIndex(text, startIndex)
    : // @ts-expect-error -- expected
      // eslint-disable-next-line prefer-rest-params
      legacyIsPreviousLineEmpty(...arguments);
}

// Legacy version of `isNextLineEmpty`
/**
 * @template N
 * @param {string} text
 * @param {N} node
 * @param {(node: N) => number} locEnd
 * @returns {boolean}
 */
function legacyIsNextLineEmpty(text, node, locEnd) {
  return isNextLineEmptyAfterIndex(text, locEnd(node));
}

// TODO: export `makeString` from `make-string.js` in v4
/**
 * @param {string} rawText
 * @param {Quote} enclosingQuote
 * @param {boolean=} unescapeUnnecessaryEscapes
 * @returns {string}
 */
export function makeString(
  rawText,
  enclosingQuote,
  unescapeUnnecessaryEscapes,
) {
  const otherQuote = enclosingQuote === '"' ? "'" : '"';

  // Matches _any_ escape and unescaped quotes (both single and double).
  const regex = /\\(.)|(["'])/gsu;

  // Escape and unescape single and double quotes as needed to be able to
  // enclose `rawText` with `enclosingQuote`.
  const raw = rawText.replaceAll(regex, (match, escaped, quote) => {
    // If we matched an escape, and the escaped character is a quote of the
    // other type than we intend to enclose the string with, there's no need for
    // it to be escaped, so return it _without_ the backslash.
    if (escaped === otherQuote) {
      return escaped;
    }

    // If we matched an unescaped quote and it is of the _same_ type as we
    // intend to enclose the string with, it must be escaped, so return it with
    // a backslash.
    if (quote === enclosingQuote) {
      return "\\" + quote;
    }

    if (quote) {
      return quote;
    }

    // Unescape any unnecessarily escaped character.
    // Adapted from https://github.com/eslint/eslint/blob/de0b4ad7bd820ade41b1f606008bea68683dc11a/lib/rules/no-useless-escape.js#L27
    return unescapeUnnecessaryEscapes &&
      /^[^\n\r"'0-7\\bfnrt-vx\u2028\u2029]$/u.test(escaped)
      ? escaped
      : "\\" + escaped;
  });

  return enclosingQuote + raw + enclosingQuote;
}

// TODO: export `isNextLineEmpty` directly in v4
/**
 * @param {string} text
 * @param {number} startIndex
 * @returns {boolean}
 */
export function isNextLineEmpty(text, startIndex) {
  return arguments.length === 2 || typeof startIndex === "number"
    ? isNextLineEmptyAfterIndex(text, startIndex)
    : // @ts-expect-error -- expected
      // eslint-disable-next-line prefer-rest-params
      legacyIsNextLineEmpty(...arguments);
}

export {
  addDanglingComment,
  addLeadingComment,
  addTrailingComment,
} from "../main/comments/utilities.js";
export { default as getAlignmentSize } from "./get-alignment-size.js";
export { default as getIndentSize } from "./get-indent-size.js";
export { default as getMaxContinuousCount } from "./get-max-continuous-count.js";
export { default as getNextNonSpaceNonCommentCharacter } from "./get-next-non-space-non-comment-character.js";
export { default as getPreferredQuote } from "./get-preferred-quote.js";
export { default as getStringWidth } from "./get-string-width.js";
export { default as hasNewline } from "./has-newline.js";
export { default as hasNewlineInRange } from "./has-newline-in-range.js";
export { default as hasSpaces } from "./has-spaces.js";
export {
  skip,
  skipEverythingButNewLine,
  skipSpaces,
  skipToLineEnd,
  skipWhitespace,
} from "./skip.js";
export { default as skipInlineComment } from "./skip-inline-comment.js";
export { default as skipNewline } from "./skip-newline.js";
export { default as skipTrailingComment } from "./skip-trailing-comment.js";

// TODO: Remove this in v4
export { isNextLineEmptyAfterIndex };
