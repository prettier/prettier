"use strict";

function unescape(str) {
  return str.replace(
    /((?:\\\\)*)\\`/g,
    (_, backslashes) => "\\".repeat(backslashes.length / 2) + "`"
  );
}

function dedent(text) {
  const indentation = getIndentation(text);
  const hasIndent = indentation !== "";
  if (hasIndent) {
    return {
      text: text.replace(new RegExp(`^${indentation}`, "gm"), ""),
      hasIndent,
    };
  }
  return { text, hasIndent };
}

function getIndentation(str) {
  const firstMatchedIndent = str.match(/^([^\S\n]*)\S/m);
  return firstMatchedIndent === null ? "" : firstMatchedIndent[1];
}

module.exports = {
  unescape,
  dedent,
};
