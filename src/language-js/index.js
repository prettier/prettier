"use strict";

const estreePrinter = require("./printer-estree");
const estreeJsonPrinter = require("./printer-estree-json");
const options = require("./options");
const languageExtend = require("../utils/language-extend");

const languages = [
  languageExtend({}, require("linguist-languages/data/javascript"), {
    since: "0.0.0",
    parsers: ["babylon", "flow"],
    vscodeLanguageIds: ["javascript"]
  }),
  Object.assign(
    languageExtend({}, require("linguist-languages/data/javascript"), {
      name: "Flow",
      since: "0.0.0",
      parsers: ["babylon", "flow"],
      vscodeLanguageIds: ["javascript"]
    }),
    // overwrite
    {
      aliases: [],
      filenames: [],
      extensions: [".js.flow"]
    }
  ),
  languageExtend({}, require("linguist-languages/data/jsx"), {
    since: "0.0.0",
    parsers: ["babylon", "flow"],
    vscodeLanguageIds: ["javascriptreact"]
  }),
  languageExtend({}, require("linguist-languages/data/typescript"), {
    since: "1.4.0",
    parsers: ["typescript-eslint"],
    vscodeLanguageIds: ["typescript", "typescriptreact"]
  }),
  Object.assign(
    languageExtend({}, require("linguist-languages/data/json"), {
      name: "JSON.stringify",
      since: "1.13.0",
      parsers: ["json-stringify"],
      vscodeLanguageIds: ["json"]
    }),
    // overwrite
    {
      extensions: [], // .json file defaults to json instead of json-stringify
      filenames: ["package.json", "package-lock.json", "composer.json"]
    }
  ),
  languageExtend({}, require("linguist-languages/data/json"), {
    since: "1.5.0",
    parsers: ["json"],
    filenames: [".prettierrc"],
    vscodeLanguageIds: ["json"]
  }),
  languageExtend({}, require("linguist-languages/data/json-with-comments"), {
    since: "1.5.0",
    parsers: ["json"],
    filenames: [".eslintrc"],
    vscodeLanguageIds: ["jsonc"]
  }),
  languageExtend({}, require("linguist-languages/data/json5"), {
    since: "1.13.0",
    parsers: ["json5"],
    vscodeLanguageIds: ["json5"]
  })
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
