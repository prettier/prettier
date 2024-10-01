/** @import {Quote} from "./get-preferred-quote.js" */

/**
 * @param {string} rawText
 * @param {Quote} enclosingQuote
 * @param {boolean=} unescapeUnnecessaryEscapes
 * @returns {string}
 */
function makeString(rawText, enclosingQuote, unescapeUnnecessaryEscapes) {
  const otherQuote = enclosingQuote === '"' ? "'" : '"';

  // Matches _any_ escape and unescaped quotes (both single and double).
  const regex = /\\(.)|(["'])/gsu;

  // Escape and unescape single and double quotes as needed to be able to
  // enclose `rawText` with `enclosingQuote`.
  const raw = rawText.replaceAll(regex, (match, escaped, quote) => {
    // If we matched an escape, and the escaped character is a quote of the
    // other type than we intend to enclose the string with, there's no need for
    // it to be escaped, so return it _without_ the backslash.
    if (escaped === otherQuote) {
      return escaped;
    }

    // If we matched an unescaped quote and it is of the _same_ type as we
    // intend to enclose the string with, it must be escaped, so return it with
    // a backslash.
    if (quote === enclosingQuote) {
      return "\\" + quote;
    }

    if (quote) {
      return quote;
    }

    // Unescape any unnecessarily escaped character.
    // Adapted from https://github.com/eslint/eslint/blob/de0b4ad7bd820ade41b1f606008bea68683dc11a/lib/rules/no-useless-escape.js#L27
    return unescapeUnnecessaryEscapes &&
      /^[^\n\r"'0-7\\bfnrt-vx\u2028\u2029]$/u.test(escaped)
      ? escaped
      : "\\" + escaped;
  });

  return enclosingQuote + raw + enclosingQuote;
}

export default makeString;
