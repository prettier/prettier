"use strict";

const { parseWithComments, strip, extract, print } = require("jest-docblock");
const { getShebang } = require("../common/util");
const { normalizeEndOfLine } = require("../common/end-of-line");

function parseDocBlock(text) {
  const shebang = getShebang(text);
  if (shebang) {
    text = text.slice(shebang.length + 1);
  }

  const docBlock = extract(text);
  const { pragmas, comments } = parseWithComments(docBlock);

  return { shebang, text, pragmas, comments };
}

function hasPragma(text) {
  const pragmas = Object.keys(parseDocBlock(text).pragmas);
  return pragmas.includes("prettier") || pragmas.includes("format");
}

function insertPragma(originalText) {
  const { shebang, text, pragmas, comments } = parseDocBlock(originalText);
  const strippedText = strip(text);

  const docBlock = print({
    pragmas: {
      format: "",
      ...pragmas,
    },
    comments: comments.trimStart(),
  });

  return (
    (shebang ? `${shebang}\n` : "") +
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
