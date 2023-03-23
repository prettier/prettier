import createParsers from "../utils/create-parsers.js";
import printer from "./printer-graphql.js";

export const printers = {
  graphql: printer,
};
export const parsers = createParsers([
  {
    importParsers: () => import("./parser-graphql.js"),
    parserNames: ["graphql"],
  },
]);
export { default as languages } from "./languages.evaluate.js";
export { default as options } from "./options.js";
