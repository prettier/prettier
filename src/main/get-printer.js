"use strict";

function getPrinter(options) {
  switch (options.parser) {
    case "graphql":
      return require("../language-graphql/printer-graphql");
    case "parse5":
      return require("../language-html/printer-htmlparser2");
    case "css":
    case "less":
    case "scss":
      return require("../language-css/printer-postcss");
    case "markdown":
      return require("../language-markdown/printer-markdown");
    default:
      return require("../language-js/printer-estree");
  }
}

module.exports = getPrinter;
