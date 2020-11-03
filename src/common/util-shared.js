"use strict";

const {
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
  getNextNonSpaceNonCommentCharacterIndex,
  makeString,
  addLeadingComment,
  addDanglingComment,
  addTrailingComment,
} = require("./util");

const returnFalseIfNegativeOne = (fn) => (...args) => {
  const result = fn(...args);
  return result === -1 ? false : result;
};

module.exports = {
  getMaxContinuousCount,
  getStringWidth,
  getAlignmentSize,
  getIndentSize,
  hasNewline,
  hasNewlineInRange,
  hasSpaces,
  isNextLineEmpty,
  isNextLineEmptyAfterIndex,
  isPreviousLineEmpty,
  makeString,
  addLeadingComment,
  addDanglingComment,
  addTrailingComment,
  // TODO: Change these functions to use `-1` instead of `false` in v3.0.0
  skip(chars) {
    return (text, index, opts) => {
      return index === false
        ? false
        : returnFalseIfNegativeOne(skip(chars))(text, index, opts);
    };
  },
  skipNewline(text, index, opts) {
    return index === false ? false : skipNewline(text, index, opts);
  },
  skipInlineComment(text, index) {
    return index === false ? false : skipInlineComment(text, index);
  },
  skipTrailingComment(text, index) {
    return index === false ? false : skipTrailingComment(text, index);
  },
  skipWhitespace: returnFalseIfNegativeOne(skipWhitespace),
  skipSpaces: returnFalseIfNegativeOne(skipSpaces),
  skipToLineEnd: returnFalseIfNegativeOne(skipToLineEnd),
  skipEverythingButNewLine: returnFalseIfNegativeOne(skipEverythingButNewLine),
  getNextNonSpaceNonCommentCharacterIndex: returnFalseIfNegativeOne(
    getNextNonSpaceNonCommentCharacterIndex
  ),
};
