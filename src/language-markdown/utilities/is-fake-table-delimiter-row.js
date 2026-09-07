const tableDelimiterRowStartRegex = /^[ |:-]+$/;
const tableDelimiterRowRegex = /^\|?(?: *:?-+:? *\|)* *:?-+:? *\|?$/;

/**
 * A delimiter row with spaces around its cells, e.g. `| --- | --- |`, is
 * split into several sibling word nodes by the whitespace in between, so
 * checking a single word alone (`|`) misses it. Starting at `startIndex`,
 * rebuild the line until a part can no longer belong to a delimiter row, then
 * check it against GFM's delimiter row grammar
 * (https://github.github.com/gfm/#delimiter-row).
 *
 * @param {import("../utilities.js").TextNode[]} siblings
 * @param {number} startIndex
 * @returns {boolean}
 */
function isFakeTableDelimiterRowLine(siblings, startIndex) {
  let line = "";
  for (let i = startIndex; i < siblings.length; i++) {
    const { type, value } = siblings[i];
    if (
      (type !== "word" && type !== "whitespace") ||
      !tableDelimiterRowStartRegex.test(line + value)
    ) {
      break;
    }
    line += value;
  }
  return tableDelimiterRowRegex.test(line.trim());
}

export { isFakeTableDelimiterRowLine };
