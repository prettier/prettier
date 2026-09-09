import * as assert from "#universal/assert";
import { replaceEndOfLine } from "../../document/index.js";
import { getPreferredQuote } from "../../utilities/get-preferred-quote.js";
import { locEnd, locStart } from "../loc.js";

function printMdxJsxAttributeValue(path, options, print) {
  const { node } = path;

  if (typeof node.value !== "string") {
    return [print("value")];
  }

  const attributeText = options.originalText.slice(
    locStart(node),
    locEnd(node),
  );
  const equalSignIndex = attributeText.indexOf("=");
  assert.ok(equalSignIndex !== -1);

  let raw = attributeText.slice(equalSignIndex + 1);

  // Mdx allows space around `=`
  raw = raw.trim();
  assert.ok(/^(?<quote>["']).*\k<quote>$/s.test(raw));

  let final = raw
    .slice(1, -1)
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
