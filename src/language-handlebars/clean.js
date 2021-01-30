"use strict";

function clean(ast, newNode /*, parent*/) {
  // (Glimmer/HTML) ignore TextNode
  if (ast.type === "TextNode") {
    return null;
  }

  // `class` is reformatted
  if (ast.type === "AttrNode" && ast.name.toLowerCase() === "class") {
    delete newNode.value;
  }
}

clean.ignoredProperties = new Set(["loc", "selfClosing"]);

module.exports = clean;
