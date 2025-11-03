// Not using a regexp here because regexps for trimming off trailing
// characters are known to have performance issues.

/**
Trim trailing `Tab(U+0009)` and `Space(U+0020)` from text

@param {string} text
@returns
*/
function trimTrailingIndentation(text) {
  let end = text.length - 1;

  while (end >= 0) {
    const character = text[end];
    if (character !== " " && character !== "\t") {
      break;
    }
    end--;
  }

  return text.slice(0, end + 1);
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

export {
  trimIndentation,
  // Exposed for benchmark test
  trimTrailingIndentation,
};
