// Not using a regexp here because regexps for trimming off trailing
// characters are known to have performance issues.

/**
Trim trailing `Tab(U+0009)` and `Space(U+0020)` from text

@param {string} text
@returns
*/
function trimTrailingIndentation(text) {
  const length = getTrialingIndentionLength(text);
  return length === 0 ? text : text.slice(0, text.length - length);
}

const isIndentionCharacter = (character) =>
  character === " " || character === "\t";

function getTrialingIndentionLength(text) {
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
Trim `Tab(U+0009)` and `Space(U+0020)` at the end of line

@param {string} text
@returns {{text: string, count: number}}
*/
function trimIndentation(text) {
  const trimmed = trimTrailingIndentation(text);

  return { text: trimmed, count: text.length - trimmed.length };
}

export { trimIndentation };
