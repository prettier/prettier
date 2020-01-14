"use strict";

function isGlimmerComponent(node) {
  if (node.type !== "ElementNode") {
    return false;
  }

  const tagFirstChar = node.tag && node.tag[0];
  const isLocal = node.tag.indexOf(".") !== -1;

  return tagFirstChar.toUpperCase() === tagFirstChar || isLocal;
}

module.exports = {
  isGlimmerComponent
};
