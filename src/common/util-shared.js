import { getNextNonSpaceNonCommentCharacterIndex as getNextNonSpaceNonCommentCharacterIndexWithStartIndex } from "./util.js";

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
    // @ts-expect-error -- expected
    // eslint-disable-next-line prefer-rest-params
    : legacyGetNextNonSpaceNonCommentCharacterIndex(...arguments);
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
  isNextLineEmpty,
  isNextLineEmptyAfterIndex,
  isPreviousLineEmpty,
  getNextNonSpaceNonCommentCharacter,
  makeString,
  addLeadingComment,
  addDanglingComment,
  addTrailingComment,
} from "./util.js";
