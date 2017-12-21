"use strict";

const parse = require("./parser-postcss");
const printer = require("./printer-postcss");

const languages = [
  {
    name: "CSS",
    since: "1.4.0",
    parsers: ["css"],
    astFormat: "postcss",
    group: "CSS",
    tmScope: "source.css",
    aceMode: "css",
    codemirrorMode: "css",
    codemirrorMimeType: "text/css",
    extensions: [".css", ".pcss", ".postcss"],
    liguistLanguageId: 50,
    vscodeLanguageIds: ["css", "postcss"]
  },
  {
    name: "Less",
    since: "1.4.0",
    parsers: ["less"],
    astFormat: "postcss",
    group: "CSS",
    extensions: [".less"],
    tmScope: "source.css.less",
    aceMode: "less",
    codemirrorMode: "css",
    codemirrorMimeType: "text/css",
    liguistLanguageId: 198,
    vscodeLanguageIds: ["less"]
  },
  {
    name: "SCSS",
    since: "1.4.0",
    parsers: ["scss"],
    astFormat: "postcss",
    group: "CSS",
    tmScope: "source.scss",
    aceMode: "scss",
    codemirrorMode: "css",
    codemirrorMimeType: "text/x-scss",
    extensions: [".scss"],
    liguistLanguageId: 329,
    vscodeLanguageIds: ["scss"]
  }
];

const parsers = {
  postcss: parse
};

const printers = {
  postcss: printer
};

module.exports = {
  languages,
  parsers,
  printers
};
