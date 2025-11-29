/**
@typedef {"auto" | OPTION[keyof OPTION]} EndOfLineOption
@typedef {CHARACTER[keyof CHARACTER]} EndOfLine
*/

const OPTION = Object.freeze({ CR: "cr", CRLF: "crlf", LF: "lf" });
const CHARACTER = Object.freeze({ CR: "\r", CRLF: "crlf", LF: "\n" });

const DEFAULT_OPTION = OPTION.LF;
const DEFAULT_EOL = CHARACTER.LF;

/**
@param {string} text
@returns {EndOfLineOption}
*/
function guessEndOfLine(text) {
  const index = text.indexOf(CHARACTER.CR);
  if (index !== -1) {
    return text.charAt(index + 1) === CHARACTER.LF ? OPTION.CRLF : OPTION.CR;
  }
  return DEFAULT_OPTION;
}

/**
@param {EndOfLineOption} value
@returns {EndOfLine}
*/
function convertEndOfLineToChars(value) {
  return value === OPTION.CR
    ? CHARACTER.CR
    : value === OPTION.CRLF
      ? CHARACTER.CRLF
      : DEFAULT_EOL;
}

const regexps = new Map([
  [CHARACTER.LF, /\n/gu],
  [CHARACTER.CR, /\r/gu],
  [CHARACTER.CRLF, /\r\n/gu],
]);

/**
@param {string} text
@param {EndOfLine} eol
@returns {number}
*/
function countEndOfLineChars(text, eol) {
  const regex = regexps.get(eol);

  /* c8 ignore next */
  if (!regex) {
    throw new Error(`Unexpected "eol" ${JSON.stringify(eol)}.`);
  }

  return text.match(regex)?.length ?? 0;
}

/**
@param {string} text
@returns {string}
*/
function normalizeEndOfLine(text) {
  return text.replaceAll(/\r\n?/gu, CHARACTER.LF);
}

export {
  convertEndOfLineToChars,
  countEndOfLineChars,
  guessEndOfLine,
  normalizeEndOfLine,
};
