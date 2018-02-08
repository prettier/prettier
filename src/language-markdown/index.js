"use strict";

const printer = require("./printer-markdown");
const options = require("./options");

// Based on:
// https://github.com/github/linguist/blob/master/lib/linguist/languages.yml

const languages = [
  {
    name: "Markdown",
    since: "1.8.0",
    parsers: ["remark"],
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

const remark = {
  get parse() {
    return eval("require")("./parser-markdown");
  },
  astFormat: "mdast"
};

const parsers = {
  remark,
  // TODO: Delete this in 2.0
  markdown: remark
};

const printers = {
  mdast: printer
};

module.exports = {
  languages,
  options,
  parsers,
  printers
};
