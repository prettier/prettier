"use strict";

/**
 * NOTE: Super inefficient, needs to be cached.
 *
 * @param {{line: number, column: number}} lineColumn
 * @param {string} text
 */
module.exports = function (lineColumn, text) {
  let index = 0;
  for (let i = 0; i < lineColumn.line - 1; ++i) {
    index = text.indexOf("\n", index) + 1;
    if (index === -1) {
      return -1;
    }
  }
  return index + lineColumn.column;
};
