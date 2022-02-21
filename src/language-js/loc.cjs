// A cjs version of loc.js to use in `../main/parser.js`
"use strict";

const isNonEmptyArray = require("../utils/is-non-empty-array.js");

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

module.exports = {
  locStart,
  locEnd,
};
