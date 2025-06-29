import printer from "./printer-glimmer.js";

export { default as getVisitorKeys } from "./get-visitor-keys.js";
export const options = {};
export * as parsers from "./parser-hbs.js";
export const printers = {
  glimmer: printer,
};
