"use strict";

const createLanguage = require("../utils/create-language");
const printer = require("./printer-glimmer");

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

const parsers = {
  get glimmer() {
    return require("./parser-glimmer").parsers.glimmer;
  },
};

module.exports = {
  languages,
  printers,
  parsers,
};
