"use strict";

const estreePrinter = require("./printer-estree");
const estreeJsonPrinter = require("./printer-estree-json");
const options = require("./options");

// Based on:
// https://github.com/github/linguist/blob/master/lib/linguist/languages.yml

const languages = [
  {
    name: "JavaScript",
    since: "0.0.0",
    parsers: ["babylon", "flow"],
    group: "JavaScript",
    tmScope: "source.js",
    aceMode: "javascript",
    codemirrorMode: "javascript",
    codemirrorMimeType: "text/javascript",
    aliases: ["js", "node"],
    extensions: [
      ".js",
      "._js",
      ".bones",
      ".es",
      ".es6",
      ".frag",
      ".gs",
      ".jake",
      ".jsb",
      ".jscad",
      ".jsfl",
      ".jsm",
      ".jss",
      ".mjs",
      ".njs",
      ".pac",
      ".sjs",
      ".ssjs",
      ".xsjs",
      ".xsjslib"
    ],
    filenames: ["Jakefile"],
    linguistLanguageId: 183,
    vscodeLanguageIds: ["javascript"]
  },
  {
    name: "JSX",
    since: "0.0.0",
    parsers: ["babylon", "flow"],
    group: "JavaScript",
    extensions: [".jsx"],
    tmScope: "source.js.jsx",
    aceMode: "javascript",
    codemirrorMode: "jsx",
    codemirrorMimeType: "text/jsx",
    liguistLanguageId: 178,
    vscodeLanguageIds: ["javascriptreact"]
  },
  {
    name: "TypeScript",
    since: "1.4.0",
    parsers: ["typescript-eslint"],
    group: "JavaScript",
    aliases: ["ts"],
    extensions: [".ts", ".tsx"],
    tmScope: "source.ts",
    aceMode: "typescript",
    codemirrorMode: "javascript",
    codemirrorMimeType: "application/typescript",
    liguistLanguageId: 378,
    vscodeLanguageIds: ["typescript", "typescriptreact"]
  },
  {
    name: "JSON.stringify",
    since: "1.13.0",
    parsers: ["json-stringify"],
    group: "JavaScript",
    tmScope: "source.json",
    aceMode: "json",
    codemirrorMode: "javascript",
    codemirrorMimeType: "application/json",
    extensions: [], // .json file defaults to json instead of json-stringify
    filenames: ["package.json", "package-lock.json", "composer.json"],
    linguistLanguageId: 174,
    vscodeLanguageIds: ["json"]
  },
  {
    name: "JSON",
    since: "1.5.0",
    parsers: ["json"],
    group: "JavaScript",
    tmScope: "source.json",
    aceMode: "json",
    codemirrorMode: "javascript",
    codemirrorMimeType: "application/json",
    extensions: [".json", ".geojson", ".JSON-tmLanguage", ".topojson"],
    filenames: [
      ".arcconfig",
      ".jshintrc",
      ".eslintrc",
      ".prettierrc",
      "composer.lock",
      "mcmod.info"
    ],
    linguistLanguageId: 174,
    vscodeLanguageIds: ["json", "jsonc"]
  },
  {
    name: "JSON5",
    since: "1.13.0",
    parsers: ["json5"],
    group: "JavaScript",
    tmScope: "source.json",
    aceMode: "json",
    codemirrorMode: "javascript",
    codemirrorMimeType: "application/json",
    extensions: [".json5"],
    filenames: [".babelrc"],
    linguistLanguageId: 175,
    vscodeLanguageIds: ["json5"]
  }
];

const printers = {
  estree: estreePrinter,
  "estree-json": estreeJsonPrinter
};

module.exports = {
  languages,
  options,
  printers
};
