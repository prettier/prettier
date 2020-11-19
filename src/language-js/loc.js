"use strict";

/**
 * @typedef {import("./types/estree").Node} Node
 */

function locStart(node, opts) {
  const { ignoreDecorators } = opts || {};

  // Handle nodes with decorators. They should start at the first decorator
  if (!ignoreDecorators) {
    const decorators =
      (node.declaration && node.declaration.decorators) || node.decorators;

    if (decorators && decorators.length > 0) {
      return locStart(decorators[0]);
    }
  }

  return node.range ? node.range[0] : node.start;
}

function locEnd(node) {
  const end = node.range ? node.range[1] : node.end;
  return node.typeAnnotation ? Math.max(end, locEnd(node.typeAnnotation)) : end;
}

/**
 * @param {Node} startNode
 * @param {Node | number} endNodeOrLength
 * @returns {number[]}
 */
function composeLoc(startNode, endNodeOrLength = startNode) {
  const start = locStart(startNode);
  const end =
    typeof endNodeOrLength === "number"
      ? start + endNodeOrLength
      : locEnd(endNodeOrLength);

  return [start, end];
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
  composeLoc,
  hasSameLocStart,
  hasSameLoc,
};
