"use strict";

function isSCSSVariable(node) {
  return Boolean(node && node.type === "word" && node.value.startsWith("$"));
}

module.exports = isSCSSVariable;
