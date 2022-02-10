"use strict";

function isSCSSNestedPropertyNode(node, options) {
  if (options.parser !== "scss") {
    return false;
  }

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
