import getPreferredQuote from "./get-preferred-quote.js";
import makeString from "./make-string.js";

/** @import {Quote} from "./get-preferred-quote.js" */

function printString(raw, options) {
  // `rawContent` is the string exactly like it appeared in the input source
  // code, without its enclosing quotes.
  const rawContent = raw.slice(1, -1);

  /** @type {Quote} */
  const enclosingQuote =
    options.parser === "json" ||
    options.parser === "jsonc" ||
    // This was added before we have the `jsonc` parser
    // If `{quoteProps: "preserve"}` and `{singleQuote: false}` (default value),
    // and `{parser: "json5"}`, double quotes are always used for strings.
    // This effectively allows using the `json5` parser for “JSON with comments and trailing commas”.
    // See https://github.com/prettier/prettier/pull/10323
    // See https://github.com/prettier/prettier/pull/15831#discussion_r1431010636
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
    // Until Prettier 3.3.3, this option was set to true for most parsers, with some exceptions like CSS.
    // Since Prettier 3.3.4, it is set to false for all parsers.
    // For more details, please see https://github.com/prettier/prettier/issues/16542#issuecomment-2282249280.
    false,
  );
}

export default printString;
