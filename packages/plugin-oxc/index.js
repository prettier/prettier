import * as oxcParsers from "../../src/language-js/parse/oxc.js";
import * as estreePrinter from "../../src/language-js/printer.js";

const AST_FORMAT = "estree-oxc";

export const parsers = Object.fromEntries(
  Object.entries(oxcParsers).map(([name, parser]) => [
    name,
    { ...parser, astFormat: AST_FORMAT },
  ]),
);

export const printers = {
  [AST_FORMAT]: estreePrinter,
};

export { default as options } from "../../src/language-js/options.js";
export { default as languages } from "./languages.evaluate.js";
