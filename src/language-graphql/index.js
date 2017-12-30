"use strict";

const printer = require("./printer-graphql");

// Based on:
// https://github.com/github/linguist/blob/master/lib/linguist/languages.yml

const languages = [
  {
    name: "GraphQL",
    since: "1.5.0",
    parsers: ["graphql"],
    extensions: [".graphql", ".gql"],
    tmScope: "source.graphql",
    aceMode: "text",
    liguistLanguageId: 139,
    vscodeLanguageIds: ["graphql"]
  }
];

const parsers = {
  graphql: {
    get parse() {
      return eval("require")("./parser-graphql");
    },
    astFormat: "graphql"
  }
};

const printers = {
  graphql: printer
};

module.exports = {
  languages,
  parsers,
  printers
};
