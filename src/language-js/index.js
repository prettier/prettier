import createParsers from "../utils/create-parsers.js";
import { default as parsersConfig } from "./parse/parsers.js";
import estreePrinter from "./printer-estree.js";

export const printers = {
  estree: estreePrinter,
};
export const parsers = createParsers(parsersConfig);
export { default as languages } from "./languages.evaluate.js";
export { default as options } from "./options.js";
