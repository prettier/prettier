"use strict";

const createLanguage = require("../utils/create-language.js");
const printer = require("./printer-graphql.js");
const options = require("./options.js");
const parsers = require("./parsers.js");

const languages = [
  createLanguage(require("linguist-languages/data/GraphQL.json"), () => ({
    since: "1.5.0",
    parsers: ["graphql"],
    vscodeLanguageIds: ["graphql"],
  })),
];

const printers = {
  graphql: printer,
};

module.exports = {
  languages,
  options,
  printers,
  parsers,
};
