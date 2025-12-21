import * as assert from "#universal/assert";
import {
  DOUBLE_QUOTE,
  getPreferredQuote,
  SINGLE_QUOTE,
} from "./get-preferred-quote.js";
import makeString from "./make-string.js";

/** @import {Quote} from "./get-preferred-quote.js" */

function printString(raw, options) {
  assert.ok(/^(?<quote>["']).*\k<quote>$/su.test(raw));

  // `rawContent` is the string exactly like it appeared in the input source
  // code, without its enclosing quotes.
  const rawContent = raw.slice(1, -1);

  /** @type {Quote} */
  let enclosingQuote;

  if (
    options.parser === "json" ||
    options.parser === "jsonc" ||
    options.parser === "json-stringify" ||
    // This was added before we have the `jsonc` parser
    // If `{quoteProps: "preserve"}` and `{singleQuote: false}` (default value),
    // and `{parser: "json5"}`, double quotes are always used for strings.
    // This effectively allows using the `json5` parser for “JSON with comments and trailing commas”.
    // See https://github.com/prettier/prettier/pull/10323
    // See https://github.com/prettier/prettier/pull/15831#discussion_r1431010636
    (options.parser === "json5" &&
      options.quoteProps === "preserve" &&
      !options.singleQuote)
  ) {
    enclosingQuote = DOUBLE_QUOTE;
  } else if (options.__isInHtmlAttribute) {
    enclosingQuote = SINGLE_QUOTE;
  } else {
    enclosingQuote = getPreferredQuote(rawContent, options.singleQuote);
  }

  const originalQuote = raw.charAt(0);

  if (originalQuote === enclosingQuote) {
    return raw;
  }

  return makeString(rawContent, enclosingQuote);
}

export default printString;
