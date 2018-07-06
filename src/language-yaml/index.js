"use strict";

const printer = require("./printer-yaml");
const options = require("./options");
const languageExtend = require("../utils/language-extend");

const languages = [
  languageExtend({}, require("linguist-languages/data/yaml"), {
    since: "1.14.0",
    parsers: ["yaml"],
    vscodeLanguageIds: ["yaml"]
  })
];

module.exports = {
  languages,
  printers: { yaml: printer },
  options
};
