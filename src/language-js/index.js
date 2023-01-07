import estreePrinter from "./printer-estree.js";

export const printers = {
  estree: estreePrinter,
};
export { default as languages } from "./languages.evaluate.js";
export { default as parsers } from "./parse/parsers.js";
