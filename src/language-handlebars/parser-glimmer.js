"use strict";
const util = require("../common/util");
const createError = require("../common/parser-create-error");

const lineColumnToIndex = util.lineColumnToIndex;

function setLocStartAndEnd(text) {
  return {
    visitor: {
      All(node) {
        node.start = lineColumnToIndex(node.loc.start, text);
        node.end = lineColumnToIndex(node.loc.end, text);
      }
    }
  };
}

function parse(text) {
  try {
    const glimmer = require("@glimmer/syntax").preprocess;
    return glimmer(text, {
      plugins: {
        ast: [() => setLocStartAndEnd(text)]
      }
    });
    /* istanbul ignore next */
  } catch (error) {
    const matches = error.message.match(/on line (\d+)/);
    if (matches) {
      throw createError(error.message, {
        start: { line: +matches[1], column: 0 },
        end: { line: +matches[1], column: 80 }
      });
    } else {
      throw error;
    }
  }
}
module.exports = parse;
