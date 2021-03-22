"use strict";

// Replace `#!` with `//` so `typescript`, `flow`, and `espree` can parse it as line comment
// Inspired by ESLint parse function https://github.com/eslint/eslint/blob/9d6063add931f0803cae1676d5df307baf114360/lib/linter/linter.js#L635
function replaceHashbang(text) {
  if (text.charAt(0) === "#" && text.charAt(1) === "!") {
    return "//" + text.slice(2);
  }

  return text;
}

module.exports = replaceHashbang;
