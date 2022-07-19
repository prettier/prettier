"use strict";

const createLanguage = require("../utils/create-language.js");
const estreePrinter = require("./printer-estree.js");
const estreeJsonPrinter = require("./printer-estree-json.js");
const options = require("./options.js");
const parsers = require("./parse/parsers.js");

const languages = [
  createLanguage(
    require("linguist-languages/data/JavaScript.json"),
    (data) => ({
      since: "0.0.0",
      parsers: [
        "babel",
        "acorn",
        "espree",
        "meriyah",
        "babel-flow",
        "babel-ts",
        "flow",
        "typescript",
      ],
      vscodeLanguageIds: ["javascript", "mongo"],
      interpreters: [
        ...data.interpreters,
        // https://github.com/google/zx
        "zx",
      ],
      extensions: [
        ...data.extensions.filter((extension) => extension !== ".jsx"),
        // WeiXin Script (Weixin Mini Programs)
        // https://developers.weixin.qq.com/miniprogram/en/dev/framework/view/wxs/
        ".wxs",
      ],
    })
  ),
  createLanguage(require("linguist-languages/data/JavaScript.json"), () => ({
    name: "Flow",
    since: "0.0.0",
    parsers: ["flow", "babel-flow"],
    vscodeLanguageIds: ["javascript"],
    aliases: [],
    filenames: [],
    extensions: [".js.flow"],
  })),
  createLanguage(require("linguist-languages/data/JavaScript.json"), () => ({
    name: "JSX",
    since: "0.0.0",
    parsers: [
      "babel",
      "babel-flow",
      "babel-ts",
      "flow",
      "typescript",
      "espree",
      "meriyah",
    ],
    vscodeLanguageIds: ["javascriptreact"],
    aliases: undefined,
    filenames: undefined,
    extensions: [".jsx"],
    group: "JavaScript",
    interpreters: undefined,
    tmScope: "source.js.jsx",
    aceMode: "javascript",
    codemirrorMode: "jsx",
    codemirrorMimeType: "text/jsx",
    color: undefined,
  })),
  createLanguage(require("linguist-languages/data/TypeScript.json"), () => ({
    since: "1.4.0",
    parsers: ["typescript", "babel-ts"],
    vscodeLanguageIds: ["typescript"],
  })),
  createLanguage(require("linguist-languages/data/TSX.json"), () => ({
    since: "1.4.0",
    parsers: ["typescript", "babel-ts"],
    vscodeLanguageIds: ["typescriptreact"],
  })),
  createLanguage(require("linguist-languages/data/JSON.json"), () => ({
    name: "JSON.stringify",
    since: "1.13.0",
    parsers: ["json-stringify"],
    vscodeLanguageIds: ["json"],
    extensions: [".importmap"], // .json file defaults to json instead of json-stringify
    filenames: ["package.json", "package-lock.json", "composer.json"],
  })),
  createLanguage(require("linguist-languages/data/JSON.json"), (data) => ({
    since: "1.5.0",
    parsers: ["json"],
    vscodeLanguageIds: ["json"],
    extensions: data.extensions.filter((extension) => extension !== ".jsonl"),
  })),
  createLanguage(
    require("linguist-languages/data/JSON with Comments.json"),
    (data) => ({
      since: "1.5.0",
      parsers: ["json"],
      vscodeLanguageIds: ["jsonc"],
      filenames: [...data.filenames, ".eslintrc", ".swcrc"],
    })
  ),
  createLanguage(require("linguist-languages/data/JSON5.json"), () => ({
    since: "1.13.0",
    parsers: ["json5"],
    vscodeLanguageIds: ["json5"],
  })),
];

const printers = {
  estree: estreePrinter,
  "estree-json": estreeJsonPrinter,
};

module.exports = {
  languages,
  options,
  printers,
  parsers,
};
