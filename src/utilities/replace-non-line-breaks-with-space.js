import * as assert from "#universal/assert";

/**
Replaces all characters in the input string except line breaks `\n` with a space.

@param {string} string - The input string to process.
@returns {string}
*/
function replaceNonLineBreaksWithSpace(string) {
  const replaced = string.replaceAll(/[^\n]/g, " ");

  if (process.env.NODE_ENV !== "production") {
    assert.equal(replaced.length, string.length);
  }

  return replaced;
}

export default replaceNonLineBreaksWithSpace;
