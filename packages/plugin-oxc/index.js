import jsOptions from "../../src/language-js/options.js";
import * as oxcParsers from "../../src/language-js/parse/oxc.js";
import { estree as estreePrinter } from "../../src/language-js/printers.js";

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

export const options = {
  ...jsOptions,
  oxcRawTransferMode: {
    category: "JavaScript",
    type: "boolean",
    default: false,
    description:
      "Enable Oxc parser’s raw transfer mode on platforms that support it.",
  },
};

export { default as languages } from "./languages.evaluate.js";
