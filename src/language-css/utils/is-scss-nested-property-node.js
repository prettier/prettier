"use strict";

function isSCSSNestedPropertyNode(node) {
  /* istanbul ignore next */
  if (!node.selector) {
    return false;
  }

  return node.selector
    .replace(/\/\*.*?\*\//, "")
    .replace(/\/\/.*\n/, "")
    .trim()
    .endsWith(":");
}

module.exports = isSCSSNestedPropertyNode;
