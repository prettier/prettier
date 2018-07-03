"use strict";

const printer = require("./printer-graphql");
const options = require("./options");
const languageExtend = require("../utils/language-extend");

const languages = [
  languageExtend({}, require("linguist-languages/data/graphql"), {
    since: "1.5.0",
    parsers: ["graphql"],
    vscodeLanguageIds: ["graphql"]
  })
];

const printers = {
  graphql: printer
};

module.exports = {
  languages,
  options,
  printers
};
