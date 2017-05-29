"use strict";

function createError(message, line, column) {
  // Construct an error similar to the ones thrown by Babylon.
  const error = new SyntaxError(message + " (" + line + ":" + column + ")");
  error.loc = { line, column };
  return error;
}

module.exports = createError;
