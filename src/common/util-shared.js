"use strict";

const util = require("./util");
const { mapDoc } = require("../doc").utils;

function isNextLineEmpty(text, node, options) {
  return util.isNextLineEmpty(text, node, options.locEnd);
}

function isPreviousLineEmpty(text, node, options) {
  return util.isPreviousLineEmpty(text, node, options.locStart);
}

function getNextNonSpaceNonCommentCharacterIndex(text, node, options) {
  return util.getNextNonSpaceNonCommentCharacterIndex(
    text,
    node,
    options.locEnd
  );
}

module.exports = {
  getMaxContinuousCount: util.getMaxContinuousCount,
  getStringWidth: util.getStringWidth,
  getAlignmentSize: util.getAlignmentSize,
  getIndentSize: util.getIndentSize,
  skip: util.skip,
  skipWhitespace: util.skipWhitespace,
  skipSpaces: util.skipSpaces,
  skipNewline: util.skipNewline,
  skipToLineEnd: util.skipToLineEnd,
  skipEverythingButNewLine: util.skipEverythingButNewLine,
  skipInlineComment: util.skipInlineComment,
  skipTrailingComment: util.skipTrailingComment,
  hasNewline: util.hasNewline,
  hasNewlineInRange: util.hasNewlineInRange,
  hasSpaces: util.hasSpaces,
  isNextLineEmpty,
  isNextLineEmptyAfterIndex: util.isNextLineEmptyAfterIndex,
  isPreviousLineEmpty,
  getNextNonSpaceNonCommentCharacterIndex,
  mapDoc, // TODO: remove in 2.0, we already exposed it in docUtils
  makeString: util.makeString,
  addLeadingComment: util.addLeadingComment,
  addDanglingComment: util.addDanglingComment,
  addTrailingComment: util.addTrailingComment
};
