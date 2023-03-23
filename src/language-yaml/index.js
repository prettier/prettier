import createParsers from "../utils/create-parsers.js";
import printer from "./printer-yaml.js";

export const printers = {
  yaml: printer,
};
export const parsers = createParsers([
  {
    importParsers: () => import("./parser-yaml.js"),
    parserNames: ["yaml"],
  },
]);
export { default as languages } from "./languages.evaluate.js";
export { default as options } from "./options.js";
