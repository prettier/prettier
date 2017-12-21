"use strict";

const parse = require("./parser-markdown");
const printer = require("./printer-markdown");

const languages = [
  {
    name: "Markdown",
    since: "1.8.0",
    parsers: ["remark"],
    astFormat: "remark",
    aliases: ["pandoc"],
    aceMode: "markdown",
    codemirrorMode: "gfm",
    codemirrorMimeType: "text/x-gfm",
    wrap: true,
    extensions: [
      ".md",
      ".markdown",
      ".mdown",
      ".mdwn",
      ".mkd",
      ".mkdn",
      ".mkdown",
      ".ron",
      ".workbook"
    ],
    filenames: ["README"],
    tmScope: "source.gfm",
    linguistLanguageId: 222,
    vscodeLanguageIds: ["markdown"]
  }
];

const parsers = {
  remark: parse
};

const printers = {
  remark: printer
};

module.exports = {
  languages,
  parsers,
  printers
};
