"use strict";

module.exports = function(ast, newNode) {
  delete newNode.loc;
  delete newNode.selfClosing;

  // (Glimmer/HTML) ignore TextNode whitespace
  if (ast.type === "TextNode") {
    if (ast.chars.trim() === "") {
      return null;
    }
    newNode.chars = ast.chars.trim();
  }
};
