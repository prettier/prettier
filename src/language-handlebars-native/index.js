import { handlebars } from "./parser-handlebars.js";
import printer from "./printer-handlebars.js";

export const parsers = {
  handlebars,
};

export const printers = {
  handlebars: printer,
};

export { default as languages } from "./languages.evaluate.js";
