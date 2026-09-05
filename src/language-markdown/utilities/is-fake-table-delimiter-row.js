import { isNewLine } from "../utilities.js";

const tableDelimiterRowStartRegex = /^[ |:-]+$/;
const tableDelimiterRowRegex = /^\|?(?: *:?-+:? *\|)* *:?-+:? *\|?$/;

/**
 * A delimiter row with spaces around its cells, e.g. `| --- | --- |`, is
 * split into several sibling word nodes by the whitespace in between, so
 * checking a single word alone (`|`) misses it. Starting at `startIndex`,
 * collect consecutive delimiter-row-shaped words up to the next newline and
 * check the reconstructed line against GFM's delimiter row grammar
 * (https://github.github.com/gfm/#delimiter-row).
 *
 * @param {import("../utilities.js").TextNode[]} siblings
 * @param {number} startIndex
 * @returns {boolean}
 */
function isFakeTableDelimiterRowLine(siblings, startIndex) {
  const words = [];
  for (let i = startIndex; i < siblings.length; i++) {
    const sibling = siblings[i];
    if (sibling.type === "whitespace") {
      if (isNewLine(sibling)) {
        break;
      }
      continue;
    }
    if (
      sibling.type !== "word" ||
      !tableDelimiterRowStartRegex.test(sibling.value)
    ) {
      break;
    }
    words.push(sibling.value);
  }
  return tableDelimiterRowRegex.test(words.join(" "));
}

export { isFakeTableDelimiterRowLine };
