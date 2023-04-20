import createParsers from "../utils/create-parsers.js";
import printer from "./printer-markdown.js";

export const printers = {
  mdast: printer,
};
export const parsers = createParsers([
  {
    importParsers: () => import("./parser-markdown.js"),
    parserNames: ["remark", "markdown", "mdx"],
  },
]);
export { default as languages } from "./languages.evaluate.js";
export { default as options } from "./options.js";
