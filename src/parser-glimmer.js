"use strict";

const createError = require("./parser-create-error");

function parse(text) {
  // Inline the require to avoid loading all the JS if we don't use it
  const glimmer = require("@glimmer/syntax");

  try {
    return glimmer.preprocess(text);
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
