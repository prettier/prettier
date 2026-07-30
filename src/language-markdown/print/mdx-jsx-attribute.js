import { replaceEndOfLine } from "../../document/index.js";
import { getPreferredQuote } from "../../utilities/get-preferred-quote.js";
import { locEnd, locStart } from "../loc.js";

function printMdxJsxAttributeValue(path, options, print) {
  const { node } = path;
  const { value } = node;

  if (typeof value !== "string") {
    return [print("value")];
  }

  const raw = options.originalText.slice(locStart(node), locEnd(node));
  let final = raw
    .slice(raw.search(/['"]/u) + 1, -1)
    .replaceAll("&apos;", "'")
    .replaceAll("&quot;", '"');
  const quote = getPreferredQuote(final, options.jsxSingleQuote);
  final =
    quote === '"'
      ? final.replaceAll('"', "&quot;")
      : final.replaceAll("'", "&apos;");

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
