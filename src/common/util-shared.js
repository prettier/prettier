"use strict";

const util = require("./util");

function isNextLineEmpty(text, node, options) {
  return util.isNextLineEmpty(text, node, options.locEnd);
}

function getNextNonSpaceNonCommentCharacterIndex(text, node, options) {
  return util.getNextNonSpaceNonCommentCharacterIndex(
    text,
    node,
    options.locEnd
  );
}

module.exports = {
  isNextLineEmpty,
  isNextLineEmptyAfterIndex: util.isNextLineEmptyAfterIndex,
  getNextNonSpaceNonCommentCharacterIndex,
  mapDoc: util.mapDoc,
  makeString: util.makeString
};
