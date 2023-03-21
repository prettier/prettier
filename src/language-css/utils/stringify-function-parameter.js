"use strict";

const getRootNode = require("./get-root-node.js");

/**
 * @param {*} node
 * @returns {string}
 */
function stringifyFunctionParameter(node) {
  const text = getRootNode(node).text.slice(
    node.group.open.sourceIndex + 1,
    node.group.close.sourceIndex
  );
  const innerText = text.trim();
  return innerText;
}

module.exports = stringifyFunctionParameter;
