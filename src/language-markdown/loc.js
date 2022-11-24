"use strict";

function locStart(node) {
  return node.position.start.offset;
}

function locEnd(node) {
  return node.position.end.offset;
}

module.exports = { locStart, locEnd };
