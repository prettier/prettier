"use strict";

const printer = require("./printer-postcss");
const options = require("./options");
const privateUtil = require("../common/util");

const lineColumnToIndex = privateUtil.lineColumnToIndex;
const getLast = privateUtil.getLast;

// Based on:
// https://github.com/github/linguist/blob/master/lib/linguist/languages.yml

const languages = [
  {
    name: "CSS",
    since: "1.4.0",
    parsers: ["css"],
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

const postcss = {
  get parse() {
    return eval("require")("./parser-postcss");
  },
  astFormat: "postcss",
  locEnd: function(node) {
    const endNode = node.nodes && getLast(node.nodes);
    if (endNode && node.source && !node.source.end) {
      node = endNode;
    }
    if (node.source) {
      return lineColumnToIndex(node.source.end, node.source.input.css);
    }
    return null;
  },
  locStart: function(node) {
    if (node.source) {
      return lineColumnToIndex(node.source.start, node.source.input.css) - 1;
    }
    return null;
  }
};

// TODO: switch these to just `postcss` and use `language` instead.
const parsers = {
  css: postcss,
  less: postcss,
  scss: postcss
};

const printers = {
  postcss: printer
};

module.exports = {
  languages,
  options,
  parsers,
  printers
};
