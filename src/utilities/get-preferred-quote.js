/**
 * @typedef {SINGLE_QUOTE | DOUBLE_QUOTE} Quote
 */

const SINGLE_QUOTE = "'";
const DOUBLE_QUOTE = '"';

const SINGLE_QUOTE_DATA = Object.freeze({
  character: SINGLE_QUOTE,
  codePoint: 39,
});
const DOUBLE_QUOTE_DATA = Object.freeze({
  character: DOUBLE_QUOTE,
  codePoint: 34,
});

const SINGLE_QUOTE_SETTINGS = Object.freeze({
  preferred: SINGLE_QUOTE_DATA,
  alternate: DOUBLE_QUOTE_DATA,
});
const DOUBLE_QUOTE_SETTINGS = Object.freeze({
  preferred: DOUBLE_QUOTE_DATA,
  alternate: SINGLE_QUOTE_DATA,
});

/**
 * @param {string} text
 * @param {Quote | boolean} preferredQuoteOrPreferSingleQuote
 * @returns {Quote}
 */
function getPreferredQuote(text, preferredQuoteOrPreferSingleQuote) {
  const { preferred, alternate } =
    preferredQuoteOrPreferSingleQuote === true ||
    preferredQuoteOrPreferSingleQuote === SINGLE_QUOTE
      ? SINGLE_QUOTE_SETTINGS
      : DOUBLE_QUOTE_SETTINGS;
  const { length } = text;
  let preferredQuoteCount = 0;
  let alternateQuoteCount = 0;

  // `for..of` loop is known slower
  for (let index = 0; index < length; index++) {
    const codePoint = text.charCodeAt(index);
    if (codePoint === preferred.codePoint) {
      preferredQuoteCount++;
    } else if (codePoint === alternate.codePoint) {
      alternateQuoteCount++;
    }
  }

  return (preferredQuoteCount > alternateQuoteCount ? alternate : preferred)
    .character;
}

export default getPreferredQuote;
