"use strict";

const printer = require("./printer-postcss");
const options = require("./options");
const createLanguage = require("../utils/create-language");

const languages = [
  createLanguage(require("linguist-languages/data/css"), {
    override: {
      since: "1.4.0",
      parsers: ["css"],
      vscodeLanguageIds: ["css"]
    }
  }),
  createLanguage(require("linguist-languages/data/postcss"), {
    override: {
      since: "1.4.0",
      parsers: ["css"],
      vscodeLanguageIds: ["postcss"]
    },
    extend: {
      extensions: [".postcss"]
    }
  }),
  createLanguage(require("linguist-languages/data/less"), {
    override: {
      since: "1.4.0",
      parsers: ["less"],
      vscodeLanguageIds: ["less"]
    }
  }),
  createLanguage(require("linguist-languages/data/scss"), {
    override: {
      since: "1.4.0",
      parsers: ["scss"],
      vscodeLanguageIds: ["scss"]
    }
  })
];

const printers = {
  postcss: printer
};

module.exports = {
  languages,
  options,
  printers
};
