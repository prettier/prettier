"use strict";

const createError = require("../../common/parser-create-error");

function createBabelParseError(error) {
  // babel error prints (l:c) with cols that are zero indexed
  // so we need our custom error
  const { message, loc } = error;

  return createError(message.replace(/ \(.*\)/, ""), {
    start: {
      line: loc ? loc.line : 0,
      column: loc ? loc.column + 1 : 0,
    },
  });
}

module.exports = createBabelParseError;
