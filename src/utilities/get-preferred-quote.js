/**
 * @typedef {SINGLE_QUOTE | DOUBLE_QUOTE} Quote
 */

const SINGLE_QUOTE = "'";
const DOUBLE_QUOTE = '"';

/**
 * @param {string} text
 * @param {Quote | boolean} preferredQuoteOrPreferSingleQuote
 * @returns {Quote}
 */
function getPreferredQuote(text, preferredQuoteOrPreferSingleQuote) {
  const preferred =
    preferredQuoteOrPreferSingleQuote === true ||
    preferredQuoteOrPreferSingleQuote === SINGLE_QUOTE
      ? SINGLE_QUOTE
      : DOUBLE_QUOTE;
  const alternate = preferred === SINGLE_QUOTE ? DOUBLE_QUOTE : SINGLE_QUOTE;
  const preferredCodePoint = preferred.charAt(0);
  const alternateCodePoint = alternate.charAt(0);
  const { length } = text;
  let preferredQuoteCount = 0;
  let alternateQuoteCount = 0;

  for (let index = 0; index < length; index++) {
    const codePoint = text.charCodeAt(index);
    if (codePoint === preferredCodePoint) {
      preferredQuoteCount++;
    } else if (codePoint === alternateCodePoint) {
      alternateQuoteCount++;
    }
  }

  return preferredQuoteCount > alternateQuoteCount ? alternate : preferred;
}

export default getPreferredQuote;
