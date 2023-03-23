import printer from "./printer-graphql.js";

export const printers = {
  graphql: printer,
};
export * as parsers from "./parser-graphql.js";
export { default as languages } from "./languages.evaluate.js";
export { default as options } from "./options.js";
