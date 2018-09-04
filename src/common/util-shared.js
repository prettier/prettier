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
  skipWhitespace: util.skipWhitespace,
  skipSpaces: util.skipSpaces,
  skipNewline: util.skipNewline,
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
