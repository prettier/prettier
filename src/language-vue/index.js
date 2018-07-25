"use strict";

const printer = require("./printer-vue");
const languageExtend = require("../utils/language-extend");

const languages = [
  languageExtend({}, require("linguist-languages/data/vue"), {
    since: "1.10.0",
    parsers: ["vue"],
    vscodeLanguageIds: ["vue"]
  })
];

const printers = {
  vue: printer
};

module.exports = {
  languages,
  printers
};
