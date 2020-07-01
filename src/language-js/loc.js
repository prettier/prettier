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
  const length = typeof endNodeOrLength === "number" ? endNodeOrLength : -1;
  const start = locStart(startNode);
  const end = length !== -1 ? start + length : locEnd(endNodeOrLength);
  const startLoc = startNode.loc.start;
  return {
    start,
    end,
    range: [start, end],
    loc: {
      start: startLoc,
      end:
        length !== -1
          ? { line: startLoc.line, column: startLoc.column + length }
          : endNodeOrLength.loc.end,
    },
  };
}

module.exports = {
  locStart,
  locEnd,
  composeLoc,
};
