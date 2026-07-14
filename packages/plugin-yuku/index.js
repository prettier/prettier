import * as yukuParsers from "../../src/language-js/parse/yuku.js";
import { estree as estreePrinter } from "../../src/language-js/printers.js";

const AST_FORMAT = "estree-yuku";

export const parsers = Object.fromEntries(
  Object.entries(yukuParsers).map(([name, parser]) => [
    name,
    { ...parser, astFormat: AST_FORMAT },
  ]),
);

export const printers = {
  [AST_FORMAT]: estreePrinter,
};

export { default as options } from "../../src/language-js/options.js";
export { default as languages } from "./languages.evaluate.js";
