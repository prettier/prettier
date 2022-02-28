import { createRequire } from "node:module";
import createLanguage from "../utils/create-language.js";
import printer from "./printer-graphql.js";
import options from "./options.js";
import parsers from "./parsers.js";

const require = createRequire(import.meta.url);

const languages = [
  createLanguage(require("linguist-languages/data/GraphQL.json"), () => ({
    since: "1.5.0",
    parsers: ["graphql"],
    vscodeLanguageIds: ["graphql"],
  })),
];

const printers = {
  graphql: printer,
};

const language = {
  languages,
  options,
  printers,
  parsers,
};

export default language;
