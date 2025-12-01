/**
@typedef {"auto" | OPTION[keyof OPTION]} EndOfLineOption
@typedef {CHARACTER[keyof CHARACTER]} EndOfLine
*/

const OPTION = Object.freeze({ CR: "cr", CRLF: "crlf", LF: "lf" });
const CHARACTER = Object.freeze({ CR: "\r", CRLF: "\r\n", LF: "\n" });

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
function convertEndOfLineOptionToCharacter(endOfLineOption) {
  return endOfLineOption === OPTION.CR
    ? CHARACTER.CR
    : endOfLineOption === OPTION.CRLF
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
function countEndOfLineCharacters(text, endOfLineCharacter) {
  const regex = regexps.get(endOfLineCharacter);

  /* c8 ignore next */
  if (!regex) {
    throw new Error(
      `Unexpected "endOfLineCharacter" ${JSON.stringify(endOfLineCharacter)}.`,
    );
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
  convertEndOfLineOptionToCharacter,
  countEndOfLineCharacters,
  guessEndOfLine,
  normalizeEndOfLine,
};
