import getNextNonSpaceNonCommentCharacterIndexWithStartIndex from "./get-next-non-space-non-comment-character-index.js";
import isNextLineEmptyAfterIndex from "./is-next-line-empty.js";
import isPreviousLineEmptyWithStartIndex from "./is-previous-line-empty.js";

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
} from "../main/comments/utils.js";
export { default as getAlignmentSize } from "./get-alignment-size.js";
export { default as getIndentSize } from "./get-indent-size.js";
export { default as getMaxContinuousCount } from "./get-max-continuous-count.js";
export { default as getNextNonSpaceNonCommentCharacter } from "./get-next-non-space-non-comment-character.js";
export { default as getPreferredQuote } from "./get-preferred-quote.js";
export { default as getStringWidth } from "./get-string-width.js";
export { default as hasNewline } from "./has-newline.js";
export { default as hasNewlineInRange } from "./has-newline-in-range.js";
export { default as hasSpaces } from "./has-spaces.js";
export { default as makeString } from "./make-string.js";
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
