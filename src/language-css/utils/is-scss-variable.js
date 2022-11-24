"use strict";

function isSCSSVariable(node) {
  return Boolean(node?.type === "word" && node.value.startsWith("$"));
}

module.exports = isSCSSVariable;
