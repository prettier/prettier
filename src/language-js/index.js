"use strict";

const estreePrinter = require("./printer-estree");
const estreeJsonPrinter = require("./printer-estree-json");
const options = require("./options");
const createLanguage = require("../utils/create-language");

const languages = [
  createLanguage(require("linguist-languages/data/JavaScript"), data =>
    Object.assign(data, {
      since: "0.0.0",
      parsers: ["babel", "flow"],
      vscodeLanguageIds: ["javascript", "mongo"],
      interpreters: data.interpreters.concat(["nodejs"])
    })
  ),
  createLanguage(require("linguist-languages/data/JavaScript"), data =>
    Object.assign(data, {
      name: "Flow",
      since: "0.0.0",
      parsers: ["babel", "flow"],
      vscodeLanguageIds: ["javascript"],
      aliases: [],
      filenames: [],
      extensions: [".js.flow"]
    })
  ),
  createLanguage(require("linguist-languages/data/JSX"), data =>
    Object.assign(data, {
      since: "0.0.0",
      parsers: ["babel", "flow"],
      vscodeLanguageIds: ["javascriptreact"]
    })
  ),
  createLanguage(require("linguist-languages/data/TypeScript"), data =>
    Object.assign(data, {
      since: "1.4.0",
      parsers: ["typescript"],
      vscodeLanguageIds: ["typescript"]
    })
  ),
  createLanguage(require("linguist-languages/data/TSX"), data =>
    Object.assign(data, {
      since: "1.4.0",
      parsers: ["typescript"],
      vscodeLanguageIds: ["typescriptreact"]
    })
  ),
  createLanguage(require("linguist-languages/data/JSON"), data =>
    Object.assign(data, {
      name: "JSON.stringify",
      since: "1.13.0",
      parsers: ["json-stringify"],
      vscodeLanguageIds: ["json"],
      extensions: [], // .json file defaults to json instead of json-stringify
      filenames: ["package.json", "package-lock.json", "composer.json"]
    })
  ),
  createLanguage(require("linguist-languages/data/JSON"), data =>
    Object.assign(data, {
      since: "1.5.0",
      parsers: ["json"],
      vscodeLanguageIds: ["json"],
      filenames: data.filenames.concat([".prettierrc"])
    })
  ),
  createLanguage(require("linguist-languages/data/JSON with Comments"), data =>
    Object.assign(data, {
      since: "1.5.0",
      parsers: ["json"],
      vscodeLanguageIds: ["jsonc"],
      filenames: data.filenames.concat([".eslintrc"])
    })
  ),
  createLanguage(require("linguist-languages/data/JSON5"), data =>
    Object.assign(data, {
      since: "1.13.0",
      parsers: ["json5"],
      vscodeLanguageIds: ["json5"]
    })
  )
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
