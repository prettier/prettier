"use strict";

const util = require("./util");

module.exports = function(options) {
  function locStart(node) {
    return options.locStart(node);
  }

  function locEnd(node) {
    return options.locEnd(node);
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
