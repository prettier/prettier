"use strict";

function getShebang(text) {
  if (!text.startsWith("#!")) {
    return "";
  }
  const index = text.indexOf("\n");
  if (index === -1) {
    return text;
  }
  return text.slice(0, index);
}

module.exports = getShebang;
