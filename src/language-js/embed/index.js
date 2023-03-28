import { label } from "../../document/builders.js";
import printCss from "./css.js";
import printGraphQL from "./graphql.js";
import printHtml from "./html.js";
import printMarkdown from "./markdown.js";

function embed(path) {
  const { node } = path;

  if (
    node.type !== "TemplateLiteral" ||
    // Bail out if any of the quasis have an invalid escape sequence
    // (which would make the `cooked` value be `null`)
    hasInvalidCookedValue(node)
  ) {
    return;
  }

  let embedder;
  for (const getEmbedder of [
    printCss,
    printGraphQL,
    printHtml,
    printMarkdown,
  ]) {
    embedder = getEmbedder(path);

    if (!embedder) {
      continue;
    }

    // Special case: whitespace-only template literals
    if (node.quasis.length === 1 && node.quasis[0].value.raw.trim() === "") {
      return "``";
    }

    return async (...args) => {
      const doc = await embedder(...args);
      return doc && label({ embed: true, ...doc.label }, doc);
    };
  }
}

function hasInvalidCookedValue({ quasis }) {
  return quasis.some(({ value: { cooked } }) => cooked === null);
}

export default embed;
