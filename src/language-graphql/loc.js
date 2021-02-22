"use strict";

function locStart(node) {
  return node.kind === "Comment" ? node.start : node.loc.start;
}

function locEnd(node) {
  return node.kind === "Comment" ? node.end : node.loc.end;
}

module.exports = { locStart, locEnd };
