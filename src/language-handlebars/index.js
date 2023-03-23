import createParsers from "../utils/create-parsers.js";
import printer from "./printer-glimmer.js";

export const printers = {
  glimmer: printer,
};
export const parsers = createParsers([
  {
    importParsers: () => import("./parser-glimmer.js"),
    parserNames: ["glimmer"],
  },
]);
export { default as languages } from "./languages.evaluate.js";
