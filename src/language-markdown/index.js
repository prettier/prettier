import { createRequire } from "node:module";
import createLanguage from "../utils/create-language.js";
import printer from "./printer-markdown.js";
import options from "./options.js";
import parsers from "./parsers.js";

const require = createRequire(import.meta.url);

const languages = [
  createLanguage(require("linguist-languages/data/Markdown.json"), (data) => ({
    since: "1.8.0",
    parsers: ["markdown"],
    vscodeLanguageIds: ["markdown"],
    filenames: [...data.filenames, "README"],
    extensions: data.extensions.filter((extension) => extension !== ".mdx"),
  })),
  createLanguage(require("linguist-languages/data/Markdown.json"), () => ({
    name: "MDX",
    since: "1.15.0",
    parsers: ["mdx"],
    vscodeLanguageIds: ["mdx"],
    filenames: [],
    extensions: [".mdx"],
  })),
];

const printers = {
  mdast: printer,
};

const language = {
  languages,
  options,
  printers,
  parsers,
};

export default language;
