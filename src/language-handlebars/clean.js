"use strict";

function clean(ast, newNode /*, parent*/) {
  // (Glimmer/HTML) ignore TextNode
  if (ast.type === "TextNode") {
    const trimmed = ast.chars.trim();
    if (!trimmed) {
      return null;
    }
    newNode.chars = trimmed.replace(/[\t\n\f\r ]+/g, " ");
  }

  // `class` is reformatted
  if (ast.type === "AttrNode" && ast.name.toLowerCase() === "class") {
    delete newNode.value;
  }
}

clean.ignoredProperties = new Set(["loc", "selfClosing"]);

module.exports = clean;
