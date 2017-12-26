"use strict";

const printer = require("./printer-vue");

// Based on:
// https://github.com/github/linguist/blob/master/lib/linguist/languages.yml

const languages = [
  {
    name: "Vue",
    since: "1.10.0",
    parsers: ["vue"],
    group: "HTML",
    tmScope: "text.html.vue",
    aceMode: "html",
    codemirrorMode: "htmlmixed",
    codemirrorMimeType: "text/html",
    extensions: [".vue"],
    linguistLanguageId: 146,
    vscodeLanguageIds: ["vue"]
  }
];

const massageAstNode = (ast, newObj) => {
  delete newObj.contentStart;
  delete newObj.contentEnd;
};

const parsers = {
  vue: {
    get parse() {
      return eval("require")("./parser-vue");
    },
    astFormat: "vue",
    massageAstNode
  }
};

const printers = {
  vue: printer
};

module.exports = {
  languages,
  parsers,
  printers
};
