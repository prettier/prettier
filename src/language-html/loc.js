"use strict";

function locStart(node) {
  return node.sourceSpan.start.offset;
}

function locEnd(node) {
  return node.sourceSpan.end.offset;
}

module.exports = { locStart, locEnd };
