"use strict";

function guessEndOfLine(text) {
  const index = text.indexOf("\r");
  if (index >= 0) {
    return text.charAt(index + 1) === "\n" ? "crlf" : "cr";
  }
  return "lf";
}

function convertEndOfLineToChars(value) {
  switch (value) {
    case "cr":
      return "\r";
    case "crlf":
      return "\r\n";
    default:
      return "\n";
  }
}

function countEndOfLineChars(text, eol) {
  let regex;

  switch (eol) {
    case "\n":
      regex = /\n/g;
      break;
    case "\r":
      regex = /\r/g;
      break;
    case "\r\n":
      regex = /\r\n/g;
      break;
    default:
      /* istanbul ignore next */
      throw new Error(`Unexpected "eol" ${JSON.stringify(eol)}.`);
  }

  const endOfLines = text.match(regex);
  return endOfLines ? endOfLines.length : 0;
}

function normalizeEndOfLine(text) {
  return text.replace(/\r\n?/g, "\n");
}

module.exports = {
  guessEndOfLine,
  convertEndOfLineToChars,
  countEndOfLineChars,
  normalizeEndOfLine,
};
