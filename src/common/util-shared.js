"use strict";

const util = require("./util");

module.exports = function(options) {
  function locStart(node) {
    // Handle nodes with decorators. They should start at the first decorator
    if (options.locStart) {
      const result = options.locStart(node);
      if (result !== null) {
        return result;
      }
    } else if (
      node.declaration &&
      node.declaration.decorators &&
      node.declaration.decorators.length > 0
    ) {
      return locStart(node.declaration.decorators[0]);
    }
    if (node.decorators && node.decorators.length > 0) {
      return locStart(node.decorators[0]);
    }

    if (node.range) {
      return node.range[0];
    }
    if (typeof node.start === "number") {
      return node.start;
    }
    if (node.source) {
      return (
        util.lineColumnToIndex(node.source.start, node.source.input.css) - 1
      );
    }
    if (node.loc) {
      return node.loc.start;
    }
  }

  function locEnd(node) {
    if (options.locEnd) {
      const result = options.locEnd(node);
      if (result !== null) {
        return result;
      }
    }
    const endNode = node.nodes && util.getLast(node.nodes);
    if (endNode && node.source && !node.source.end) {
      node = endNode;
    }

    let loc;
    if (node.range) {
      loc = node.range[1];
    } else if (typeof node.end === "number") {
      loc = node.end;
    } else if (node.source) {
      loc = util.lineColumnToIndex(node.source.end, node.source.input.css);
    }

    if (node.typeAnnotation) {
      return Math.max(loc, locEnd(node.typeAnnotation));
    }

    if (node.loc && !loc) {
      return node.loc.end;
    }

    return loc;
  }

  function isNextLineEmpty(text, node) {
    return util.isNextLineEmptyAfterIndex(text, locEnd(node));
  }

  function getNextNonSpaceNonCommentCharacterIndex(text, node) {
    let oldIdx = null;
    let idx = locEnd(node);
    while (idx !== oldIdx) {
      oldIdx = idx;
      idx = util.skipSpaces(text, idx);
      idx = util.skipInlineComment(text, idx);
      idx = util.skipTrailingComment(text, idx);
      idx = util.skipNewline(text, idx);
    }
    return idx;
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
