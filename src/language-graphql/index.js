"use strict";

const printer = require("./printer-graphql");
const options = require("./options");

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
    astFormat: "graphql",
    locStart: function(node) {
      if (!node.loc) {
        return null;
      }
      return node.loc.start;
    },
    locEnd: function(node) {
      if (!node.loc) {
        return null;
      }
      return node.loc.end;
    }
  }
};

const printers = {
  graphql: printer
};

module.exports = {
  languages,
  options,
  parsers,
  printers
};
