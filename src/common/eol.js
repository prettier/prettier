"use strict";

function guessEol(text) {
  const index = text.indexOf("\r");
  if (index >= 0) {
    return text.charAt(index + 1) === "\n" ? "crlf" : "cr";
  }
  return "lf";
}

function convertEolToChars(value) {
  switch (value) {
    case "cr":
      return "\r";
    case "crlf":
      return "\r\n";
    default:
      return "\n";
  }
}

module.exports = {
  guessEol,
  convertEolToChars
};
