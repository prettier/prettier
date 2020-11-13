"use strict";

function clean(node) {
  // (Glimmer/HTML) ignore TextNode whitespace
  if (node.type === "TextNode") {
    const trimmed = node.chars.trim();
    if (!trimmed) {
      return null;
    }
    node.chars = trimmed;
  }
}
clean.ignoredProperties = new Set(["loc", "selfClosing"]);

module.exports = clean;
