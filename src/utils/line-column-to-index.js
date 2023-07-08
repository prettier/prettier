// Super inefficient, needs to be cached.
/**
 * Converts a line-column position to an index in the text.
 * @param {{ line: number, column: number }} lineColumn The line-column position to convert.
 * @param {string} text The text to convert the position in.
 * @returns {number} The index in the text corresponding to the line-column position.
 */
function lineColumnToIndex(lineColumn, text) {
  let index = 0;
  for (let i = 0; i < lineColumn.line - 1; ++i) {
    index = text.indexOf("\n", index) + 1;
  }
  return index + lineColumn.column;
}

export default lineColumnToIndex;
