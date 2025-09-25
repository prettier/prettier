import { label } from "../../document/builders.js";
import { isEmbedCss, printEmbedCss } from "./css.js";
import { isEmbedGraphQL, printEmbedGraphQL } from "./graphql.js";
import {
  isAngularComponentTemplate,
  isEmbedHtml,
  printEmbedAngular,
  printEmbedHtml,
} from "./html.js";
import { isEmbedMarkdown, printEmbedMarkdown } from "./markdown.js";

const printers = [
  { test: isEmbedCss, printEmbedCss },
  { test: isEmbedGraphQL, printEmbedGraphQL },
  { test: isEmbedHtml, printEmbedHtml },
  { test: isAngularComponentTemplate, printEmbedAngular },
  { test: isEmbedMarkdown, printEmbedMarkdown },
].map(({ test, print }) => ({
  test,
  print: createTemplateLiteralPrint(print),
}));

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

  const printer = printers.find(({ test }) => test(path));

  if (!printer) {
    return;
  }

  if (
    // Special case: whitespace-only template literals
    node.quasis.length === 1 &&
    node.quasis[0].value.raw.trim() === ""
  ) {
    return "``";
  }

  return printer.print;
}

function createTemplateLiteralPrint(print) {
  return async (...args) => {
    const doc = await print(...args);
    return doc && label({ embed: true, ...doc.label }, doc);
  };
}

function hasInvalidCookedValue({ quasis }) {
  return quasis.some(({ value: { cooked } }) => cooked === null);
}

export default embed;
