"use strict";

const createError = require("./parser-create-error");

function parse(text) {
  try {
    return require("@glimmer/syntax").preprocess(text);
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
