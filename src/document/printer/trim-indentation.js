// Not using a regexp here because regexps for trimming off trailing
// characters are known to have performance issues.

/**
Trim trailing `Tab(U+0009)` and `Space(U+0020)` from text

@param {string} text
@returns
*/
function trimTrailingIndentation(text) {
  for (let index = text.length - 1; index > 0; index--) {
    const character = text[index];

    if (character !== " " && character !== "\t") {
      return text.slice(0, index + 1);
    }
  }

  return text;
}

/**
Trim `Tab(U+0009)` and `Space(U+0020)` at the end of line

@param {string[]} buffer
@returns {{text: string, count: number}}
*/
function trimIndentation(buffer) {
  const text = buffer.join("");
  const trimmed = trimTrailingIndentation(text);

  return { text: trimmed, count: text.length - trimmed.length };
}

export { trimIndentation };
