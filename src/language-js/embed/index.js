import { label } from "../../document/index.js";
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
  { test: isEmbedCss, print: printEmbedCss },
  { test: isEmbedGraphQL, print: printEmbedGraphQL },
  { test: isEmbedHtml, print: printEmbedHtml },
  { test: isAngularComponentTemplate, print: printEmbedAngular },
  { test: isEmbedMarkdown, print: printEmbedMarkdown },
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
