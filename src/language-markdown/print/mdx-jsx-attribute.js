import { replaceEndOfLine } from "../../document/index.js";
import { getPreferredQuote } from "../../utilities/get-preferred-quote.js";
import { locEnd, locStart } from "../loc.js";

function printMdxJsxAttribute(path, options, print) {
  const { node } = path;
  const { value, name } = node;

  if (value === null) {
    return name;
  }

  if (typeof value !== "string") {
    return [name, "=", print("value")];
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
  return [name, "=", quote, replaceEndOfLine(final), quote];
}

export { printMdxJsxAttribute };
