"use strict";

const printer = require("./printer-vue");
const createLanguage = require("../utils/create-language");

const languages = [
  createLanguage(require("linguist-languages/data/vue"), {
    override: {
      since: "1.10.0",
      parsers: ["vue"],
      vscodeLanguageIds: ["vue"]
    }
  })
];

const printers = {
  vue: printer
};

module.exports = {
  languages,
  printers
};
