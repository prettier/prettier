"use strict";

const printer = require("./printer-htmlparser2");

// Based on:
// https://github.com/github/linguist/blob/master/lib/linguist/languages.yml

const languages = [
  {
    name: "HTML",
    since: null, // unreleased
    parsers: ["parse5"],
    group: "HTML",
    tmScope: "text.html.basic",
    aceMode: "html",
    codemirrorMode: "htmlmixed",
    codemirrorMimeType: "text/html",
    aliases: ["xhtml"],
    extensions: [".html", ".htm", ".html.hl", ".inc", ".st", ".xht", ".xhtml"],
    linguistLanguageId: 146,
    vscodeLanguageIds: ["html"]
  }
];

const parsers = {
  parse5: {
    get parse() {
      return eval("require")("./parser-parse5");
    },
    astFormat: "htmlparser2",
    locEnd: function(node) {
      return node.__location && node.__location.endOffset;
    },
    locStart: function(node) {
      return node.__location && node.__location.startOffset;
    }
  }
};

const printers = {
  htmlparser2: printer
};

module.exports = {
  languages,
  parsers,
  printers
};
