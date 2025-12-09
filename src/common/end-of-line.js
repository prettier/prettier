import * as assert from "#universal/assert";

/**
@typedef {"auto" | OPTION_CR | OPTION_CRLF | OPTION_LF} EndOfLineOption
@typedef {CHARACTER_CR | CHARACTER_CRLF | CHARACTER_LF} EndOfLine
*/

const OPTION_CR = "cr";
const OPTION_CRLF = "crlf";
const OPTION_LF = "lf";
const DEFAULT_OPTION = OPTION_LF;

const CHARACTER_CR = "\r";
const CHARACTER_CRLF = "\r\n";
const CHARACTER_LF = "\n";
const DEFAULT_EOL = CHARACTER_LF;

/**
@param {string} text
@returns {EndOfLineOption}
*/
function guessEndOfLine(text) {
  const index = text.indexOf(CHARACTER_CR);
  if (index !== -1) {
    return text.charAt(index + 1) === CHARACTER_LF ? OPTION_CRLF : OPTION_CR;
  }
  return DEFAULT_OPTION;
}

/**
@param {EndOfLineOption} endOfLineOption
@returns {EndOfLine}
*/
function convertEndOfLineOptionToCharacter(endOfLineOption) {
  return endOfLineOption === OPTION_CR
    ? CHARACTER_CR
    : endOfLineOption === OPTION_CRLF
      ? CHARACTER_CRLF
      : DEFAULT_EOL;
}

const regexps = new Map([
  [CHARACTER_LF, /\n/gu],
  [CHARACTER_CR, /\r/gu],
  [CHARACTER_CRLF, /\r\n/gu],
]);
/**
@param {string} text
@param {EndOfLine} endOfLineCharacter
@returns {number}
*/
function countEndOfLineCharacters(text, endOfLineCharacter) {
  const regex = regexps.get(endOfLineCharacter);

  /* c8 ignore next */
  if (process.env.NODE_ENV !== "production") {
    assert.ok(
      regex,
      `Unexpected 'endOfLineCharacter': ${JSON.stringify(endOfLineCharacter)}.`,
    );
  }

  return text.match(regex)?.length ?? 0;
}

const END_OF_LINE_REGEXP = /\r\n?/gu;
/**
@param {string} text
@returns {string}
*/
function normalizeEndOfLine(text) {
  return text.replaceAll(END_OF_LINE_REGEXP, CHARACTER_LF);
}

export {
  convertEndOfLineOptionToCharacter,
  countEndOfLineCharacters,
  guessEndOfLine,
  normalizeEndOfLine,
};
