"use strict";

const createLanguage = require("../utils/create-language.js");
const printer = require("./printer-markdown.js");
const options = require("./options.js");
const parsers = require("./parsers.js");

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

module.exports = {
  languages,
  options,
  printers,
  parsers,
};
