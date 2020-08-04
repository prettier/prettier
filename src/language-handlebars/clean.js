"use strict";

module.exports = function (ast, newNode) {
  delete newNode.loc;
  delete newNode.selfClosing;

  // (Glimmer/HTML) ignore TextNode whitespace
  if (ast.type === "TextNode") {
    const trimmed = ast.chars.trim().replace(/\s+/g, " ");
    if (!trimmed) {
      return null;
    }
    newNode.chars = trimmed;
  }
};
