function guessEndOfLine(text) {
  const index = text.indexOf("\r");
  if (index !== -1) {
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
      regex = /\n/gu;
      break;
    case "\r":
      regex = /\r/gu;
      break;
    case "\r\n":
      regex = /\r\n/gu;
      break;
    default:
      /* c8 ignore next */
      throw new Error(`Unexpected "eol" ${JSON.stringify(eol)}.`);
  }

  const endOfLines = text.match(regex);
  return endOfLines ? endOfLines.length : 0;
}

function normalizeEndOfLine(text) {
  return text.replaceAll(/\r\n?/gu, "\n");
}

export {
  convertEndOfLineToChars,
  countEndOfLineChars,
  guessEndOfLine,
  normalizeEndOfLine,
};
