"use strict";

module.exports = function(ast, newNode) {
  delete newNode.sourceCodeLocation;

  if (ast.type === "text") {
    return null;
  }

  // may be formatted by multiparser
  if (ast.type === "yaml") {
    return null;
  }
};
