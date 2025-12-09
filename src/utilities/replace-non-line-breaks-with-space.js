/**
Replaces all characters in the input string except line breaks `\n` with a space.

@param {string} string - The input string to process.
@returns {string}
*/
function replaceNonLineBreaksWithSpace(string) {
  return string.replaceAll(/[^\n]/g, " ");
}

export default replaceNonLineBreaksWithSpace;
