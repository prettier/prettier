"use strict";
const createError = require("../../../common/parser-create-error.js");

function throwSyntaxError(node, message) {
  const { start, end } = node.loc;
  throw createError(message, {
    start: { line: start.line, column: start.column + 1 },
    end: { line: end.line, column: end.column + 1 },
  });
}

module.exports = throwSyntaxError;
