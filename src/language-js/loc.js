"use strict";

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

  if (node.range) {
    return node.range[0];
  }

  if (typeof node.start === "number") {
    return node.start;
  }
}

function locEnd(node) {
  const loc = node.range
    ? node.range[1]
    : typeof node.end === "number"
    ? node.end
    : null;

  if (node.typeAnnotation) {
    return Math.max(loc, locEnd(node.typeAnnotation));
  }

  return loc;
}

function composeLoc(startNode, endNodeOrLength = startNode) {
  const start = locStart(startNode);
  const end =
    typeof endNodeOrLength === "number"
      ? start + endNodeOrLength
      : locEnd(endNodeOrLength);

  return {
    start,
    end,
    range: [start, end],
  };
}

module.exports = {
  locStart,
  locEnd,
  composeLoc,
};
