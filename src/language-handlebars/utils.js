"use strict";

function isGlimmerComponent(node) {
  if (node.type !== "ElementNode") {
    return false;
  }

  const tagFirstChar = node.tag && node.tag[0];
  const isLocal = node.tag.includes(".");

  return tagFirstChar.toUpperCase() === tagFirstChar || isLocal;
}

function isWhitespaceNode(node) {
  return node.type === "TextNode" && !/\S/.test(node.chars);
}

module.exports = {
  isWhitespaceNode,
  isGlimmerComponent
};
