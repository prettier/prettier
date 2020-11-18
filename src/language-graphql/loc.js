"use strict";

function locStart(node) {
  if (typeof node.start === "number") {
    return node.start;
  }
  return node.loc && node.loc.start;
}

function locEnd(node) {
  if (typeof node.end === "number") {
    return node.end;
  }
  return node.loc && node.loc.end;
}

module.exports = { locStart, locEnd };
