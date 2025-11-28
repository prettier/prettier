/** @import {Quote} from "./get-preferred-quote.js" */

// Matches escape and unescaped quotes (both single and double).
const REGEX = /\\(["'])|(["'])/gsu;

/**
 * @param {string} rawText
 * @param {Quote} enclosingQuote
 * @returns {string}
 */
function makeString(rawText, enclosingQuote) {
  const otherQuote = enclosingQuote === '"' ? "'" : '"';

  const raw = rawText.replaceAll(REGEX, (match, escaped, unescaped) => {
    if (unescaped) {
      return unescaped === enclosingQuote ? "\\" + unescaped : unescaped;
    }

    return escaped === enclosingQuote ? "\\\\" + escaped : escaped
  });

  return enclosingQuote + raw + enclosingQuote;
}

export default makeString;
