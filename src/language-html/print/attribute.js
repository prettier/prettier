/**
 * @import {Doc} from "../document/index.js"
 */

import { replaceEndOfLine } from "../document/index.js";
import { getPreferredQuote } from "../utilities/get-preferred-quote.js";
import {
  shouldUnquoteAttributeValue,
  unescapeQuoteEntities,
} from "./utilities/index.js";

function printAttributeValue(path, options /* , print*/) {
  const { node } = path;

  let value = unescapeQuoteEntities(node.value);

  if (shouldUnquoteAttributeValue(node, options)) {
    return value;
  }

  const quote = getPreferredQuote(value, '"');

  if (quote === '"') {
    value = value.replaceAll('"', "&quot;");
  } else if (quote === "'") {
    value = value.replaceAll("'", "&apos;");
  }

  return [quote, replaceEndOfLine(value), quote];
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
