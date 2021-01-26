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

  // `class` is reformatted
  if (ast.type === "AttrNode" && ast.name === "class") {
    delete newNode.value;
  }
}
clean.ignoredProperties = new Set(["loc", "selfClosing"]);

module.exports = clean;
