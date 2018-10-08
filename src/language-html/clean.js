"use strict";

module.exports = function(ast, newNode) {
  delete newNode.startIndex;
  delete newNode.endIndex;
  delete newNode.attribs;

  if (ast.type === "text") {
    return null;
  }

  // may be formatted by multiparser
  if (ast.type === "yaml") {
    return null;
  }

  if (ast.type === "attribute") {
    delete newNode.value;
  }

  if (ast.type === "directive" && ast.name === "!doctype") {
    delete newNode.data;
  }
};
