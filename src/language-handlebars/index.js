import { createRequire } from "node:module";
import createLanguage from "../utils/create-language.js";
import printer from "./printer-glimmer.js";
import parsers from "./parsers.js";

const require = createRequire(import.meta.url);

const languages = [
  createLanguage(require("linguist-languages/data/Handlebars.json"), () => ({
    since: "2.3.0",
    parsers: ["glimmer"],
    vscodeLanguageIds: ["handlebars"],
  })),
];

const printers = {
  glimmer: printer,
};

const language = {
  languages,
  printers,
  parsers,
};

export default language;
