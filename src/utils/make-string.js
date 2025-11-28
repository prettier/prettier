/** @import {Quote} from "./get-preferred-quote.js" */

// Matches _any_ escape and unescaped quotes (both single and double).
const REGEX = /\\(.)|(["'])/gsu;

function makeString(rawText, enclosingQuote) {
  const otherQuote = enclosingQuote === '"' ? "'" : '"';

  // Escape and unescape single and double quotes as needed to be able to
  // enclose `rawText` with `enclosingQuote`.
  const raw = rawText.replaceAll(REGEX, (match, escaped, unescaped) => {
    // If we matched an unescaped quote and it is of the _same_ type as we
    // intend to enclose the string with, it must be escaped, so return it with
    // a backslash.
    if (unescaped === enclosingQuote) {
      return "\\" + unescaped;
    }

    if (unescaped) {
      return unescaped;
    }

    // If we matched an escape, and the escaped character is a quote of the
    // other type than we intend to enclose the string with, there's no need for
    // it to be escaped, so return it _without_ the backslash.
    if (escaped === otherQuote) {
      return escaped;
    }

    return "\\" + escaped;
  });

  return enclosingQuote + raw + enclosingQuote;
}

export default makeString;
