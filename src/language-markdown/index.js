import printer from "./printer-markdown.js";
import * as parsersMarkdown from "./parser-markdown.js";
import * as parsersMdx from "./parser-mdx.js";

export const parsers = {
  ...parsersMarkdown,
  ...parsersMdx
}

export const printers = {
  mdast: printer,
};
export { default as languages } from "./languages.evaluate.js";
export { default as options } from "./options.js";
export * as parsers from "./parser-markdown.js";
