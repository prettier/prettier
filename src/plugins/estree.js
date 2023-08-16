import * as estreePrinter from "../language-js/printer.js";
import jsLanguages from "../language-js/languages.evaluate.js";
import * as estreeJsonPrinter from "../language-json/printer-estree-json.js";
import jsonLanguages from "../language-json/languages.evaluate.js";

export const printers = {
  estree: estreePrinter,
  "estree-json": estreeJsonPrinter,
};
export const languages = [...jsLanguages, ...jsonLanguages];
export { default as options } from "../language-js/options.js";
