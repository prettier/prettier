import {
  languages as jsLanguages,
  options as jsOptions,
  printers as jsPrinters,
} from "../language-js/index.js";
import {
  languages as jsonLanguages,
  printers as jsonPrinters,
} from "../language-json/index.js";

export const printers = {
  ...jsPrinters,
  ...jsonPrinters,
};
export const languages = [...jsLanguages, ...jsonLanguages];
export const options = { ...jsOptions };
