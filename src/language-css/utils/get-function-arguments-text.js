"use strict";

const getValueRoot = require("./get-root-node.js");

/**
 * @param {*} node
 * @returns {string}
 */
function getFunctionArgumentsText(node) {
  return getValueRoot(node)
    .text.slice(node.group.open.sourceIndex + 1, node.group.close.sourceIndex)
    .trim();
}

module.exports = getFunctionArgumentsText;
