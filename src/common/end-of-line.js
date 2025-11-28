/**
@typedef {"auto" | OPTION_EOL_CR | OPTION_EOL_LF | OPTION_EOL_CRLF} EndOfLineOption
@typedef {EOL_CR | EOL_LF | EOL_CRLF} EndOfLine
*/

const OPTION_EOL_CR = "cr";
const OPTION_EOL_LF = "lf";
const OPTION_EOL_CRLF = "crlf";
const DEFAULT_OPTION_EOL = OPTION_EOL_LF;

const EOL_CR = "\r";
const EOL_LF = "\n";
const EOL_CRLF = "\r\n";
const DEFAULT_EOL = EOL_LF;

/**
@param {string} text
@returns {EndOfLineOption}
*/
function guessEndOfLine(text) {
  const index = text.indexOf(EOL_CR);
  if (index !== -1) {
    return text.charAt(index + 1) === EOL_LF ? OPTION_EOL_CRLF : OPTION_EOL_CR;
  }
  return DEFAULT_OPTION_EOL;
}

/**
@param {EndOfLineOption} value
@returns {EndOfLine}
*/
function convertEndOfLineToChars(value) {
  return value === OPTION_EOL_CR
    ? EOL_CR
    : value === OPTION_EOL_CRLF
      ? EOL_CRLF
      : DEFAULT_EOL;
}

const regexps = new Map([
  [EOL_LF, /\n/gu],
  [EOL_CR, /\r/gu],
  [EOL_CRLF, /\r\n/gu],
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
  return text.replaceAll(/\r\n?/gu, EOL_LF);
}

export {
  convertEndOfLineToChars,
  countEndOfLineChars,
  guessEndOfLine,
  normalizeEndOfLine,
};
