import createParsers from "../utils/create-parsers.js";
import { default as parsersConfig } from "./parsers.js";
import printer from "./printer-graphql.js";

export const printers = {
  graphql: printer,
};
export const parsers = createParsers(parsersConfig);
export { default as languages } from "./languages.evaluate.js";
export { default as options } from "./options.js";
