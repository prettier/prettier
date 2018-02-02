"use strict";

const util = require("./util");

module.exports = function(options) {
  function locStart(node) {
    return util.locEnd(node, options.locStart);
  }

  function locEnd(node) {
    return util.locEnd(node, options.locEnd);
  }

  function isNextLineEmpty(text, node) {
    return util.isNextLineEmpty(text, node, options.locEnd);
  }

  function getNextNonSpaceNonCommentCharacterIndex(text, node) {
    return util.getNextNonSpaceNonCharacterIndex(text, node, options.locEnd);
  }

  return {
    locStart,
    locEnd,
    isNextLineEmpty,
    isNextLineEmptyAfterIndex: util.isNextLineEmptyAfterIndex,
    getNextNonSpaceNonCommentCharacterIndex,
    mapDoc: util.mapDoc,
    makeString: util.makeString
  };
};
