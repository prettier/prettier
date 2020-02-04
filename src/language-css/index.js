"use strict";

const printer = require("./printer-postcss");
const options = require("./options");
const createLanguage = require("../utils/create-language");

const languages = [
  createLanguage(require("linguist-languages/data/CSS"), data => ({
    ...data,
    since: "1.4.0",
    parsers: ["css"],
    vscodeLanguageIds: ["css"]
  })),
  createLanguage(require("linguist-languages/data/PostCSS"), data => ({
    ...data,
    since: "1.4.0",
    parsers: ["css"],
    vscodeLanguageIds: ["postcss"]
  })),
  createLanguage(require("linguist-languages/data/Less"), data => ({
    ...data,
    since: "1.4.0",
    parsers: ["less"],
    vscodeLanguageIds: ["less"]
  })),
  createLanguage(require("linguist-languages/data/SCSS"), data => ({
    ...data,
    since: "1.4.0",
    parsers: ["scss"],
    vscodeLanguageIds: ["scss"]
  }))
];

const printers = {
  postcss: printer
};

module.exports = {
  languages,
  options,
  printers
};
