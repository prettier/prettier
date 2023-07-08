import getPreferredQuote from "./get-preferred-quote.js";
import makeString from "./make-string.js";

/** @typedef {import("./get-preferred-quote.js").Quote} Quote */

/**
 * Returns a string enclosed in quotes with the minimum amount of escaped quotes.
 * @param {string} raw - The string exactly like it appeared in the input source code, without its enclosing quotes.
 * @param {Object} options - The options object.
 * @param {'json'|'json5'|'css'|'less'|'scss'|string} options.parser - The name of the parser that is being used.
 * @param {boolean} options.singleQuote - Whether to use single quotes instead of double quotes.
 * @param {boolean} options.__isInHtmlAttribute - Whether the string is in an HTML attribute.
 * @param {boolean} options.__embeddedInHtml - Whether the string is embedded in HTML.
 * @param {'preserve'|'single'|'double'} [options.quoteProps='preserve'] - How to handle quotes in object literals.
 * @returns {string} - The string enclosed in quotes with the minimum amount of escaped quotes.
 */
function printString(raw, options) {
  const rawContent = raw.slice(1, -1);

  /** @type {Quote} */
  const enclosingQuote =
    options.parser === "json" ||
    (options.parser === "json5" &&
      options.quoteProps === "preserve" &&
      !options.singleQuote)
      ? '"'
      : options.__isInHtmlAttribute
      ? "'"
      : getPreferredQuote(rawContent, options.singleQuote);

  return makeString(
    rawContent,
    enclosingQuote,
    !(
      options.parser === "css" ||
      options.parser === "less" ||
      options.parser === "scss" ||
      options.__embeddedInHtml
    ),
  );
}

export default printString;
