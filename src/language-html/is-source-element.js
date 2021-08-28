"use strict";

function isSourceElement(node, parentNode, opts) {
  if (opts.parser === "vue") {
    return node.tag !== "root";
  }
  return false;
}

module.exports = isSourceElement;
