"use strict";

const createLanguage = require("../utils/create-language");
const printer = require("./printer-graphql");
const options = require("./options");
const parsers = require("./parsers");

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
