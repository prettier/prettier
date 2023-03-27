import createParsers from "../utils/create-parsers.js";
import printer from "./printer-html.js";

export const printers = {
  html: printer,
};
export const parsers = createParsers([
  {
    importParsers: () => import("./parser-html.js"),
    parserNames: ["html", "vue", "angular", "lwc"],
  },
]);
export { default as languages } from "./languages.evaluate.js";
export { default as options } from "./options.js";
