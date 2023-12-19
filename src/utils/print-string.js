import getPreferredQuote from "./get-preferred-quote.js";
import makeString from "./make-string.js";

/** @typedef {import("./get-preferred-quote.js").Quote} Quote */

function printString(raw, options) {
  // `rawContent` is the string exactly like it appeared in the input source
  // code, without its enclosing quotes.
  const rawContent = raw.slice(1, -1);

  /** @type {Quote} */
  const enclosingQuote =
    options.parser === "json" ||
    options.parser === "jsonc" ||
    (options.parser === "json5" &&
      options.quoteProps === "preserve" &&
      !options.singleQuote)
      ? '"'
      : options.__isInHtmlAttribute
        ? "'"
        : getPreferredQuote(rawContent, options.singleQuote);

  // It might sound unnecessary to use `makeString` even if the string already
  // is enclosed with `enclosingQuote`, but it isn't. The string could contain
  // unnecessary escapes (such as in `"\'"`). Always using `makeString` makes
  // sure that we consistently output the minimum amount of escaped quotes.
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
