"use strict";

const printer = require("./printer-htmlparser2");
const createLanguage = require("../utils/create-language");

const languages = [
  createLanguage(require("linguist-languages/data/html"), {
    override: {
      since: null, // unreleased
      parsers: ["parse5"],
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
