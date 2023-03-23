import createParsers from "../utils/create-parsers.js";
import printer from "./printer-postcss.js";

export const printers = {
  postcss: printer,
};
export const parsers = createParsers(
  // TODO: switch these to just `postcss` and use `language` instead.
  [
    {
      importParsers: () => import("./parser-postcss.js"),
      parserNames: ["css", "less", "scss"],
    },
  ]
);
export { default as languages } from "./languages.evaluate.js";
export { default as options } from "./options.js";
