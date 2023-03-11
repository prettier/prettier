"use strict";

/**
 * @param {*} node
 * @returns {string}
 */
function stringifyFuncParam(node) {
  const text = node.toString();
  const innerText = text
    .trim()
    .replace(new RegExp(`^${node.value}\\(`), "")
    .replace(/\)$/, "")
    .trim();
  return innerText;
}

module.exports = stringifyFuncParam;
