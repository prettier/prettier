"use strict";

const createLanguage = require("../utils/create-language");
const printer = require("./printer-glimmer");

const languages = [
  createLanguage(require("linguist-languages/data/Handlebars"), () => ({
    since: null, // unreleased
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
};
