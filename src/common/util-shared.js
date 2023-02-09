import {
  getNextNonSpaceNonCommentCharacterIndex as getNextNonSpaceNonCommentCharacterIndexWithStartIndex,
  isPreviousLineEmpty as isPreviousLineEmptyWithStartIndex,
  isNextLineEmpty as isNextLineEmptyAfterIndex,
} from "./util.js";

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
    locEnd(node)
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
  getMaxContinuousCount,
  getStringWidth,
  getAlignmentSize,
  getIndentSize,
  skip,
  skipWhitespace,
  skipSpaces,
  skipNewline,
  skipToLineEnd,
  skipEverythingButNewLine,
  skipInlineComment,
  skipTrailingComment,
  hasNewline,
  hasNewlineInRange,
  hasSpaces,
  getNextNonSpaceNonCommentCharacter,
  makeString,
  addLeadingComment,
  addDanglingComment,
  addTrailingComment,
  // Remove this in v4
  isNextLineEmpty as isNextLineEmptyAfterIndex,
} from "./util.js";
