"use strict";

const createLanguage = require("../utils/create-language");
const printer = require("./printer-xml");
const options = require("./options");

const languages = [
  createLanguage(require("linguist-languages/data/XML"), () => ({
    since: "0.0.0",
    parsers: ["xml"],
    vscodeLanguageIds: ["xml", "forcesourcemanifest"],
  })),
  createLanguage(require("linguist-languages/data/SVG"), () => ({
    since: "0.0.0",
    parsers: ["xml"],
    vscodeLanguageIds: ["svg"],
  })),
];

const printers = {
  xml: printer,
};

const parsers = {
  get xml() {
    return require("./parser-xml");
  },
};

module.exports = {
  languages,
  options,
  printers,
  parsers,
};
