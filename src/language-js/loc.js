"use strict";

const isNonEmptyArray = require("../utils/is-non-empty-array.js");

/**
 * @typedef {import("./types/estree").Node} Node
 */

function locStart(node) {
  const start = node.range ? node.range[0] : node.start;

  // Handle nodes with decorators. They should start at the first decorator
  const decorators = node.declaration?.decorators ?? node.decorators;
  if (isNonEmptyArray(decorators)) {
    return Math.min(locStart(decorators[0]), start);
  }

  return start;
}

function locEnd(node) {
  return node.range ? node.range[1] : node.end;
}

/**
 * @param {Node} nodeA
 * @param {Node} nodeB
 * @returns {boolean}
 */
function hasSameLocStart(nodeA, nodeB) {
  const nodeAStart = locStart(nodeA);
  return Number.isInteger(nodeAStart) && nodeAStart === locStart(nodeB);
}

/**
 * @param {Node} nodeA
 * @param {Node} nodeB
 * @returns {boolean}
 */
function hasSameLocEnd(nodeA, nodeB) {
  const nodeAEnd = locEnd(nodeA);
  return Number.isInteger(nodeAEnd) && nodeAEnd === locEnd(nodeB);
}

/**
 * @param {Node} nodeA
 * @param {Node} nodeB
 * @returns {boolean}
 */
function hasSameLoc(nodeA, nodeB) {
  return hasSameLocStart(nodeA, nodeB) && hasSameLocEnd(nodeA, nodeB);
}

module.exports = {
  locStart,
  locEnd,
  hasSameLocStart,
  hasSameLoc,
};
