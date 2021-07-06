"use strict";

const { isNonEmptyArray } = require("../common/util");

/**
 * @typedef {import("./types/estree").Node} Node
 */

function locStart(node, opts) {
  const { ignoreDecorators } = opts || {};

  // Handle nodes with decorators. They should start at the first decorator
  if (!ignoreDecorators) {
    const decorators =
      (node.declaration && node.declaration.decorators) || node.decorators;

    if (isNonEmptyArray(decorators)) {
      return locStart(decorators[0]);
    }
  }

  return node.range ? node.range[0] : node.start;
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
  return locStart(nodeA) === locStart(nodeB);
}

/**
 * @param {Node} nodeA
 * @param {Node} nodeB
 * @returns {boolean}
 */
function hasSameLocEnd(nodeA, nodeB) {
  return locEnd(nodeA) === locEnd(nodeB);
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
