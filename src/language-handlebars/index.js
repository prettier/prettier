"use strict";

const createLanguage = require("../utils/create-language.js");
const printer = require("./printer-glimmer.js");
const parsers = require("./parsers.js");

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
