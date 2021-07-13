"use strict";

const createLanguage = require("../utils/create-language");
const printer = require("./printer-glimmer");
const parsers = require("./parsers");

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

module.exports = {
  languages,
  printers,
  parsers,
};
