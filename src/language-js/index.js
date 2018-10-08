"use strict";

const estreePrinter = require("./printer-estree");
const estreeJsonPrinter = require("./printer-estree-json");
const options = require("./options");
const createLanguage = require("../utils/create-language");

const languages = [
  createLanguage(require("linguist-languages/data/javascript"), {
    override: {
      since: "0.0.0",
      parsers: ["babylon", "flow"],
      vscodeLanguageIds: ["javascript"]
    },
    extend: {
      interpreters: ["nodejs"]
    }
  }),
  createLanguage(require("linguist-languages/data/javascript"), {
    override: {
      name: "Flow",
      since: "0.0.0",
      parsers: ["babylon", "flow"],
      vscodeLanguageIds: ["javascript"],

      aliases: [],
      filenames: [],
      extensions: [".js.flow"]
    }
  }),
  createLanguage(require("linguist-languages/data/jsx"), {
    override: {
      since: "0.0.0",
      parsers: ["babylon", "flow"],
      vscodeLanguageIds: ["javascriptreact"]
    }
  }),
  createLanguage(require("linguist-languages/data/typescript"), {
    override: {
      since: "1.4.0",
      parsers: ["typescript"],
      vscodeLanguageIds: ["typescript", "typescriptreact"]
    }
  }),
  createLanguage(require("linguist-languages/data/json"), {
    override: {
      name: "JSON.stringify",
      since: "1.13.0",
      parsers: ["json-stringify"],
      vscodeLanguageIds: ["json"],

      extensions: [], // .json file defaults to json instead of json-stringify
      filenames: ["package.json", "package-lock.json", "composer.json"]
    }
  }),
  createLanguage(require("linguist-languages/data/json"), {
    override: {
      since: "1.5.0",
      parsers: ["json"],
      vscodeLanguageIds: ["json"]
    },
    extend: {
      filenames: [".prettierrc"]
    }
  }),
  createLanguage(require("linguist-languages/data/json-with-comments"), {
    override: {
      since: "1.5.0",
      parsers: ["json"],
      vscodeLanguageIds: ["jsonc"]
    },
    extend: {
      filenames: [".eslintrc"]
    }
  }),
  createLanguage(require("linguist-languages/data/json5"), {
    override: {
      since: "1.13.0",
      parsers: ["json5"],
      vscodeLanguageIds: ["json5"]
    }
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
