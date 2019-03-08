"use strict";

const printer = require("./printer-glimmer");
const createLanguage = require("../utils/create-language");

const languages = [
  createLanguage(require("linguist-languages/data/handlebars"), {
    override: {
      since: null, // unreleased
      parsers: ["glimmer"],
      vscodeLanguageIds: ["handlebars"]
    }
  })
];

const printers = {
  glimmer: printer
};

module.exports = {
  languages,
  printers
};
