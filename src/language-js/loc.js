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

  return node.range ? node.range[0] : node.start;
}

function locEnd(node) {
  const end = node.range ? node.range[1] : node.end;
  return node.typeAnnotation ? Math.max(end, locEnd(node.typeAnnotation)) : end;
}

function composeLoc(startNode, endNodeOrLength = startNode) {
  const start = locStart(startNode);
  const end =
    typeof endNodeOrLength === "number"
      ? start + endNodeOrLength
      : locEnd(endNodeOrLength);

  return [start, end];
}

module.exports = {
  locStart,
  locEnd,
  composeLoc,
};
