"use strict";

const createError = require("../common/parser-create-error");

function parse(text) {
  try {
    const glimmer = require("@glimmer/syntax").preprocess;
    return glimmer(text, {
      plugins: {
        ast: []
      },
      mode: "codemod"
    });
    /* istanbul ignore next */
  } catch (error) {
    const matches = error.message.match(/on line (\d+)/);
    if (matches) {
      throw createError(error.message, {
        start: { line: Number(matches[1]), column: 0 }
      });
    } else {
      throw error;
    }
  }
}

module.exports = {
  parsers: {
    glimmer: {
      parse,
      astFormat: "glimmer",
      locStart(node) {
        return node.loc && node.loc.start;
      },
      locEnd(node) {
        return node.loc && node.loc.end;
      }
    }
  }
};
