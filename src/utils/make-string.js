/** @import {Quote} from "./get-preferred-quote.js" */

// Matches _any_ escape and unescaped quotes (both single and double).
const REGEX = /\\?(?<quote>["'])/gu;

/**
 * @param {string} rawText
 * @param {Quote} enclosingQuote
 * @returns {string}
 */
function makeString(rawText, enclosingQuote) {
  return (
    enclosingQuote +
    rawText.replaceAll(
      REGEX,
      (_, quote) => (quote === enclosingQuote ? "\\" : "") + quote,
    ) +
    enclosingQuote
  );
}

export default makeString;
