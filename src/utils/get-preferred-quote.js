/**
 * @typedef {'"' | "'"} Quote
 */

/**
 *
 * @param {string} rawContent
 * @param {Quote} preferredQuote
 * @returns {{ quote: Quote, regex: RegExp, escaped: string }}
 */

function getPreferredQuote(rawContent, preferredQuote) {
  /** @type {{ quote: '"', regex: RegExp, escaped: "&quot;" }} */
  const double = { quote: '"', regex: /"/g, escaped: "&quot;" };
  /** @type {{ quote: "'", regex: RegExp, escaped: "&apos;" }} */
  const single = { quote: "'", regex: /'/g, escaped: "&apos;" };

  const preferred = preferredQuote === "'" ? single : double;
  const alternate = preferred === single ? double : single;

  let result = preferred;

  // If `rawContent` contains at least one of the quote preferred for enclosing
  // the string, we might want to enclose with the alternate quote instead, to
  // minimize the number of escaped quotes.
  if (
    rawContent.includes(preferred.quote) ||
    rawContent.includes(alternate.quote)
  ) {
    const numPreferredQuotes = (rawContent.match(preferred.regex) || []).length;
    const numAlternateQuotes = (rawContent.match(alternate.regex) || []).length;

    result = numPreferredQuotes > numAlternateQuotes ? alternate : preferred;
  }

  return result;
}

export default getPreferredQuote;
