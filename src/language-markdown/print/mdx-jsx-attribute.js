import { replaceEndOfLine } from "../../document/index.js";
import { getPreferredQuote } from "../../utilities/get-preferred-quote.js";
import { locEnd, locStart } from "../loc.js";

function printMdxJsxAttributeValue(path, options, print) {
  const { node } = path;

  if (typeof node.value !== "string") {
    return [print("value")];
  }

  const text = options.originalText.slice(locStart(node), locEnd(node));

  const valueStart = text.search(/['"]/u) + 1;

  const raw = text
    .slice(valueStart, -1)
    .replaceAll("&apos;", "'")
    .replaceAll("&quot;", '"');
  const quote = getPreferredQuote(raw, options.jsxSingleQuote);
  const final =
    quote === '"'
      ? raw.replaceAll('"', "&quot;")
      : raw.replaceAll("'", "&apos;");

  return [quote, replaceEndOfLine(final), quote];
}

// Based on `printJsxAttribute` in ESTree printer
function printMdxJsxAttribute(path, options, print) {
  const parts = [path.node.name];

  if (path.node.value !== null) {
    parts.push("=", printMdxJsxAttributeValue(path, options, print));
  }

  return parts;
}

export { printMdxJsxAttribute };
