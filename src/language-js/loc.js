"use strict";

const isNonEmptyArray = require("../utils/is-non-empty-array.js");
const getLast = require("../utils/get-last.js");

/**
 * @typedef {import("./types/estree").Node} Node
 */

function locStart(node, options = {}) {
  const { ignoreDecorators } = options;

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

function locEnd(node, options = {}) {
  const { forCommentAttach } = options;

  if (forCommentAttach && node.type === "VariableDeclaration") {
    const lastDeclaration = getLast(node.declarations);
    if (lastDeclaration && lastDeclaration.init) {
      return locEnd(lastDeclaration);
    }
  }

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
