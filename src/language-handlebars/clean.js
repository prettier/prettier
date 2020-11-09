"use strict";

function clean(ast, newNode /*, parent*/) {
  // (Glimmer/HTML) ignore TextNode whitespace
  if (ast.type === "TextNode") {
    const trimmed = ast.chars.trim();
    if (!trimmed) {
      return null;
    }
    newNode.chars = trimmed;
  }
}
clean.ignoredProperties = new Set(["loc", "selfClosing"]);

module.exports = clean;
