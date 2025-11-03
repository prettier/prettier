// Not using a regexp here because regexps for trimming off trailing
// characters are known to have performance issues.

const SPACE = " ";
const TAB = "\t";

/**
@typedef {SPACE | TAB} IndentionCharacter
*/

/**
Check if a character is `Tab(U+0009)` or `Space(U+0020)`

@template {string} Character
@param {string} character
@returns {boolean}
*/
const isIndentionCharacter = (character) =>
  character === SPACE || character === TAB;

/**
Get trialing trailing indention length

@param {string} text
@returns {number}
*/
function getTrailingIndentionLength(text) {
  let length = 0;

  for (let index = text.length - 1; index >= 0; index--) {
    const character = text[index];

    if (!isIndentionCharacter(character)) {
      break;
    }
    length++;
  }

  return length;
}

/**
Trim trailing `Tab(U+0009)` and `Space(U+0020)` from text

@param {string} text
@returns {{text: string, count: number}}
*/
function trimIndentation(text) {
  const length = getTrailingIndentionLength(text);
  return {
    text: length === 0 ? text : text.slice(0, text.length - length),
    count: length,
  };
}

export { trimIndentation };
