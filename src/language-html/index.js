"use strict";

const printer = require("./printer-html");
const createLanguage = require("../utils/create-language");
const options = require("./options");

const languages = [
  createLanguage(require("linguist-languages/data/html"), {
    override: {
      name: "Angular",
      since: "1.15.0",
      parsers: ["angular"],
      vscodeLanguageIds: ["html"],

      extensions: [".component.html"],
      filenames: []
    }
  }),
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
  html: printer
};

module.exports = {
  languages,
  printers,
  options
};
