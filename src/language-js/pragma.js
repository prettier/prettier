"use strict";

const docblock = require("jest-docblock");

function hasPragmaInLeadingComments(text) {
  // ignore leading hashbang
  text = text.replace(/^#!.*/, "");
  const leadingCommentRegExp = /\s+|\/\/(.*)|\/\*([^]*?)\*\//gm;
  let match;
  let lastIndex = 0;
  while ((match = leadingCommentRegExp.exec(text))) {
    if (match.index !== lastIndex) {
      return false;
    }
    lastIndex = match.index + match[0].length;
    const comment = match[1] || match[2];
    if (/(\s|^)@(prettier|format)(\s|$)/.test(comment)) {
      return true;
    }
  }
  return false;
}

function hasPragma(text) {
  const pragmas = Object.keys(docblock.parse(docblock.extract(text)));
  return (
    pragmas.indexOf("prettier") !== -1 ||
    pragmas.indexOf("format") !== -1 ||
    hasPragmaInLeadingComments(text)
  );
}

function insertPragma(text) {
  const parsedDocblock = docblock.parseWithComments(docblock.extract(text));
  const pragmas = Object.assign({ format: "" }, parsedDocblock.pragmas);
  const newDocblock = docblock
    .print({
      pragmas,
      comments: parsedDocblock.comments.replace(/^(\s+?\r?\n)+/, "") // remove leading newlines
    })
    .replace(/(\r\n|\r)/g, "\n"); // normalise newlines (mitigate use of os.EOL by jest-docblock)
  const strippedText = docblock.strip(text);
  const separatingNewlines = strippedText.startsWith("\n") ? "\n" : "\n\n";
  return newDocblock + separatingNewlines + strippedText;
}

module.exports = {
  hasPragma,
  insertPragma
};
