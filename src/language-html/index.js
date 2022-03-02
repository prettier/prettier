import { createRequire } from "node:module";
import createLanguage from "../utils/create-language.js";
import printer from "./printer-html.js";
import options from "./options.js";
import parsers from "./parsers.js";

const require = createRequire(import.meta.url);

const languages = [
  createLanguage(require("linguist-languages/data/HTML.json"), () => ({
    name: "Angular",
    since: "1.15.0",
    parsers: ["angular"],
    vscodeLanguageIds: ["html"],
    extensions: [".component.html"],
    filenames: [],
  })),
  createLanguage(require("linguist-languages/data/HTML.json"), (data) => ({
    since: "1.15.0",
    parsers: ["html"],
    vscodeLanguageIds: ["html"],
    extensions: [
      ...data.extensions,
      ".mjml", // MJML is considered XML in Linguist but it should be formatted as HTML
    ],
  })),
  createLanguage(require("linguist-languages/data/HTML.json"), () => ({
    name: "Lightning Web Components",
    since: "1.17.0",
    parsers: ["lwc"],
    vscodeLanguageIds: ["html"],
    extensions: [],
    filenames: [],
  })),
  createLanguage(require("linguist-languages/data/Vue.json"), () => ({
    since: "1.10.0",
    parsers: ["vue"],
    vscodeLanguageIds: ["vue"],
  })),
];

const printers = {
  html: printer,
};

const language = {
  languages,
  printers,
  options,
  parsers,
};

export default language;
