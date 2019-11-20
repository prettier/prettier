"use strict";

const printer = require("./printer-yaml");
const options = require("./options");
const createLanguage = require("../utils/create-language");

const languages = [
  createLanguage(require("linguist-languages/data/YAML"), data =>
    Object.assign(data, {
      since: "1.14.0",
      parsers: ["yaml"],
      vscodeLanguageIds: ["yaml"]
    })
  )
];

module.exports = {
  languages,
  printers: { yaml: printer },
  options
};
