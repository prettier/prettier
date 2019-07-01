"use strict";

function isWhitespaceNode(node) {
  return node.type === "TextNode" && !/\S/.test(node.chars);
}

function beginsWithWhitespace(node) {
  return node.type === "TextNode" && !/\s+\S/.test(node.chars);
}

module.exports = {
  isWhitespaceNode,
  beginsWithWhitespace,
};
