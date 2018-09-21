"use strict";

const printer = require("./printer-htmlparser2");
const createLanguage = require("../utils/create-language");

const languages = [
  createLanguage(require("linguist-languages/data/html"), {
    override: {
      since: null, // unreleased
      parsers: ["html"],
      vscodeLanguageIds: ["html"]
    }
  })
];

const printers = {
  htmlparser2: printer
};

module.exports = {
  languages,
  printers
};
