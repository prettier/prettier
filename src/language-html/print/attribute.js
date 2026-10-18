import { replaceEndOfLine } from "../../document/index.js";
import { getPreferredQuote } from "../../utilities/get-preferred-quote.js";
import {
  shouldUnquoteAttributeValue,
  unescapeQuoteEntities,
} from "../utilities/index.js";

/**
 * @import {Doc} from "../../document/index.js"
 */

function printAttributeValue(path, options /* , print*/) {
  const { node } = path;
  const value = unescapeQuoteEntities(node.value);
  const quote = shouldUnquoteAttributeValue(node, options)
    ? ""
    : getPreferredQuote(value, '"');

  return [
    "=",
    quote,
    replaceEndOfLine(
      quote === '"'
        ? value.replaceAll('"', "&quot;")
        : value.replaceAll("'", "&apos;"),
    ),
    quote,
  ];
}

function printAttribute(path, options /* , print*/) {
  const { node } = path;
  const parts = [node.rawName];

  if (node.value !== null) {
    parts.push("=", printAttributeValue(path, options));
  }

  return parts;
}

export { printAttribute };
