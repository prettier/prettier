"use strict";

const getRootNode = require("./get-root-node.js");

/**
 * @param {*} node
 * @returns {string}
 */
function stringifyFunctionParameters(node) {
  return getRootNode(node)
    .text.slice(node.group.open.sourceIndex + 1, node.group.close.sourceIndex)
    .trim();
}

module.exports = stringifyFunctionParameters;
