"use strict";

const createLanguage = require("../utils/create-language");
const printer = require("./printer-html");
const options = require("./options");

const languages = [
  createLanguage(require("linguist-languages/data/HTML.json"), () => ({
    name: "Angular",
    since: "1.15.0",
    parsers: ["angular"],
    vscodeLanguageIds: ["html"],
    extensions: [".component.html"],
    filenames: [],
  })),
  createLanguage(require("linguist-languages/data/HTML.json"), (data) => ({
    since: "1.15.0",
    parsers: ["html"],
    vscodeLanguageIds: ["html"],
    extensions: [
      ...data.extensions,
      ".mjml", // MJML is considered XML in Linguist but it should be formatted as HTML
    ],
  })),
  createLanguage(require("linguist-languages/data/HTML.json"), () => ({
    name: "Lightning Web Components",
    since: "1.17.0",
    parsers: ["lwc"],
    vscodeLanguageIds: ["html"],
    extensions: [],
    filenames: [],
  })),
  createLanguage(require("linguist-languages/data/Vue.json"), () => ({
    since: "1.10.0",
    parsers: ["vue"],
    vscodeLanguageIds: ["vue"],
  })),
];

const printers = {
  html: printer,
};

const parsers = {
  // HTML
  get html() {
    return require("./parser-html").parsers.html;
  },
  // Vue
  get vue() {
    return require("./parser-html").parsers.vue;
  },
  // Angular
  get angular() {
    return require("./parser-html").parsers.angular;
  },
  // Lightning Web Components
  get lwc() {
    return require("./parser-html").parsers.lwc;
  },
};

module.exports = {
  languages,
  printers,
  options,
  parsers,
};
