"use strict";

const printer = require("./printer-htmlparser2");
const languageExtend = require("../utils/language-extend");

const languages = [
  languageExtend({}, require("linguist-languages/data/html"), {
    since: null, // unreleased
    parsers: ["parse5"],
    vscodeLanguageIds: ["html"]
  })
];

const printers = {
  htmlparser2: printer
};

module.exports = {
  languages,
  printers
};
