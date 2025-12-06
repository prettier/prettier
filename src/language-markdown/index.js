import * as parsersMdx from "./parser-mdx.js";
import * as parsersMarkdown from "./parser-remark-11-markdown.js";
import printer from "./printer-markdown.js";

export const parsers = {
  ...parsersMarkdown,
  ...parsersMdx,
};

export const printers = {
  mdast: printer,
};
export { default as languages } from "./languages.evaluate.js";
export { default as options } from "./options.js";
