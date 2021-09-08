"use strict";

const createLanguage = require("../utils/create-language.js");
const printer = require("./printer-postcss.js");
const options = require("./options.js");
const parsers = require("./parsers.js");

const languages = [
  createLanguage(require("linguist-languages/data/CSS.json"), (data) => ({
    since: "1.4.0",
    parsers: ["css"],
    vscodeLanguageIds: ["css"],
    extensions: [
      ...data.extensions,
      // `WeiXin Style Sheets`(Weixin Mini Programs)
      // https://developers.weixin.qq.com/miniprogram/en/dev/framework/view/wxs/
      ".wxss",
    ],
  })),
  createLanguage(require("linguist-languages/data/PostCSS.json"), () => ({
    since: "1.4.0",
    parsers: ["css"],
    vscodeLanguageIds: ["postcss"],
  })),
  createLanguage(require("linguist-languages/data/Less.json"), () => ({
    since: "1.4.0",
    parsers: ["less"],
    vscodeLanguageIds: ["less"],
  })),
  createLanguage(require("linguist-languages/data/SCSS.json"), () => ({
    since: "1.4.0",
    parsers: ["scss"],
    vscodeLanguageIds: ["scss"],
  })),
];

const printers = {
  postcss: printer,
};

module.exports = {
  languages,
  options,
  printers,
  parsers,
};
