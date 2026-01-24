// Can't bundle due to side effects
// import {
//   languages as jsLanguages,
//   options as jsOptions,
//   printers as jsPrinters,
// } from "../language-js/index.js";
import jsLanguages from "../language-js/languages.evaluate.js";
import * as jsPrinters from "../language-js/printers.js";
import {
  languages as jsonLanguages,
  printers as jsonPrinters,
} from "../language-json/index.js";

export const printers = {
  ...jsPrinters,
  ...jsonPrinters,
};
export const languages = [...jsLanguages, ...jsonLanguages];

export { default as options } from "../language-js/options.js";
