import createParsers from "../utils/create-parsers.js";
import { default as parsersConfig } from "./parsers.js";
import printer from "./printer-glimmer.js";

export const printers = {
  glimmer: printer,
};
export const parsers = createParsers(parsersConfig);
export { default as languages } from "./languages.evaluate.js";
