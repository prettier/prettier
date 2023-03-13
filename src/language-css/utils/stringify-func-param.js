"use strict";

const getHighestAncestor = require("./get-highest-ancestor.js");

/**
 * @param {*} node
 * @returns {string}
 */
function stringifyFuncParam(node) {
  const text = getHighestAncestor(node).text.slice(
    node.group.open.sourceIndex + 1,
    node.group.close.sourceIndex
  );
  const innerText = text.trim();
  return innerText;
}

module.exports = stringifyFuncParam;
