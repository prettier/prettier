"use strict";

const parse = require("./parser-graphql");
const printer = require("./printer-graphql");

const languages = [
  {
    name: "GraphQL",
    since: "1.5.0",
    parsers: ["graphql"],
    astFormat: "graphql",
    extensions: [".graphql", ".gql"],
    tmScope: "source.graphql",
    aceMode: "text",
    liguistLanguageId: 139,
    vscodeLanguageIds: ["graphql"]
  }
];

const parsers = {
  graphql: parse
};

const printers = {
  graphql: printer
};

module.exports = {
  languages,
  parsers,
  printers
};
