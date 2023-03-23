import estreePrinter from "../language-js/printer-estree.js";
import jsLanguages from "../language-js/languages.evaluate.js";
import estreeJsonPrinter from "../language-json/printer-estree-json.js";
import jsonLanguages from "../language-json/languages.evaluate.js";
import jsOptions from "../language-js/options.js";

export const printers = {
  estree: estreePrinter,
  "estree-json": estreeJsonPrinter,
};
export const languages = [...jsLanguages, ...jsonLanguages];
export const options = jsOptions;
export default { printers, languages, options };
