"use strict";

const util = require("./util");

module.exports = function(options) {
  function isNextLineEmpty(text, node) {
    return util.isNextLineEmpty(text, node, options.locEnd);
  }

  function getNextNonSpaceNonCommentCharacterIndex(text, node) {
    return util.getNextNonSpaceNonCommentCharacterIndex(
      text,
      node,
      options.locEnd
    );
  }

  return {
    isNextLineEmpty,
    isNextLineEmptyAfterIndex: util.isNextLineEmptyAfterIndex,
    getNextNonSpaceNonCommentCharacterIndex,
    mapDoc: util.mapDoc,
    makeString: util.makeString
  };
};
