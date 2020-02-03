"use strict";

module.exports = function(ast, newNode) {
  delete newNode.loc;
  delete newNode.selfClosing;

  // (Glimmer/HTML) ignore TextNode whitespace
  if (ast.type === "TextNode") {
    if (ast.chars.replace(/\s+/, "") === "") {
      return null;
    }
    newNode.chars = ast.chars.replace(/^\s+/, "").replace(/\s+$/, "");
  }
};
