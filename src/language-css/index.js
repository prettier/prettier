"use strict";

const printer = require("./printer-postcss");
const options = require("./options");
const languageExtend = require("../utils/language-extend");

const languages = [
  languageExtend({}, require("linguist-languages/data/css"), {
    since: "1.4.0",
    parsers: ["css"],
    vscodeLanguageIds: ["css"]
  }),
  languageExtend({}, require("linguist-languages/data/postcss"), {
    since: "1.4.0",
    parsers: ["css"],
    extensions: [".postcss"],
    vscodeLanguageIds: ["postcss"]
  }),
  languageExtend({}, require("linguist-languages/data/less"), {
    since: "1.4.0",
    parsers: ["less"],
    vscodeLanguageIds: ["less"]
  }),
  languageExtend({}, require("linguist-languages/data/scss"), {
    since: "1.4.0",
    parsers: ["scss"],
    vscodeLanguageIds: ["scss"]
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
