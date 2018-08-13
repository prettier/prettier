"use strict";

const printer = require("./printer-glimmer");
const languageExtend = require("../utils/language-extend");

const languages = [
  languageExtend({}, require("linguist-languages/data/handlebars"), {
    since: null, // unreleased
    parsers: ["glimmer"],
    vscodeLanguageIds: ["handlebars"]
  })
];

const printers = {
  glimmer: printer
};

module.exports = {
  languages,
  printers
};
