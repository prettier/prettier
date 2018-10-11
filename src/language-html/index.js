"use strict";

const printer = require("./printer-htmlparser2");
const createLanguage = require("../utils/create-language");
const options = require("./options");

const languages = [
  createLanguage(require("linguist-languages/data/html"), {
    override: {
      since: "1.15.0",
      parsers: ["html"],
      vscodeLanguageIds: ["html"]
    }
  }),
  createLanguage(require("linguist-languages/data/vue"), {
    override: {
      since: "1.10.0",
      parsers: ["vue"],
      vscodeLanguageIds: ["vue"]
    }
  })
];

const printers = {
  htmlparser2: printer
};

module.exports = {
  languages,
  printers,
  options
};
