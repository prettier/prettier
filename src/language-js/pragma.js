"use strict";

const { parseWithComments, strip, extract, print } = require("jest-docblock");
const parseHashbang = require("../utils/hashbang");
const { normalizeEndOfLine } = require("../common/end-of-line");

function parseDocBlock(text) {
  const hashbang = parseHashbang(text);
  if (hashbang) {
    text = text.slice(hashbang.range[1] + 1);
  }

  const docBlock = extract(text);
  const { pragmas, comments } = parseWithComments(docBlock);

  return { hashbang, text, pragmas, comments };
}

function hasPragma(text) {
  const pragmas = Object.keys(parseDocBlock(text).pragmas);
  return pragmas.includes("prettier") || pragmas.includes("format");
}

function insertPragma(originalText) {
  const { hashbang, text, pragmas, comments } = parseDocBlock(originalText);
  const strippedText = strip(text);

  const docBlock = print({
    pragmas: {
      format: "",
      ...pragmas,
    },
    comments: comments.trimStart(),
  });

  return (
    (hashbang ? `#!${hashbang.value}\n` : "") +
    // normalise newlines (mitigate use of os.EOL by jest-docblock)
    normalizeEndOfLine(docBlock) +
    (strippedText.startsWith("\n") ? "\n" : "\n\n") +
    strippedText
  );
}

module.exports = {
  hasPragma,
  insertPragma,
};
