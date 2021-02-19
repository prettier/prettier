"use strict";

function parseHashbang(text) {
  if (!text.startsWith("#!")) {
    return;
  }

  let end = text.indexOf("\n");
  if (end === -1) {
    end = text.length;
  }
  const value = text.slice(2, end);

  return {
    type: "Line",
    value,
    range: [0, end],
  };
}

module.exports = parseHashbang;
