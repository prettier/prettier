"use strict";

module.exports = function(ast, newNode) {
  delete newNode.sourceCodeLocation;
  delete newNode.attribs; // we only look at attributes

  if (ast.type === "text" || ast.type === "attribute") {
    return null;
  }

  // may be formatted by multiparser
  if (ast.type === "yaml") {
    return null;
  }
};
