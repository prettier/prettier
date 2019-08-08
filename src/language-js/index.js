"use strict";

const estreePrinter = require("./printer-estree");
const estreeJsonPrinter = require("./printer-estree-json");
const options = require("./options");
const createLanguage = require("../utils/create-language");

const languages = [
  createLanguage(require("linguist-languages/data/JavaScript"), {
    override: {
      since: "0.0.0",
      parsers: ["babel", "flow"],
      vscodeLanguageIds: ["javascript"]
    },
    extend: {
      interpreters: ["nodejs"]
    }
  }),
  createLanguage(require("linguist-languages/data/JavaScript"), {
    override: {
      name: "Flow",
      since: "0.0.0",
      parsers: ["babel", "flow"],
      vscodeLanguageIds: ["javascript"],
      aliases: [],
      filenames: [],
      extensions: [".js.flow"]
    }
  }),
  createLanguage(require("linguist-languages/data/JSX"), {
    override: {
      since: "0.0.0",
      parsers: ["babel", "flow"],
      vscodeLanguageIds: ["javascriptreact"]
    }
  }),
  createLanguage(require("linguist-languages/data/TypeScript"), {
    override: {
      since: "1.4.0",
      parsers: ["typescript"],
      vscodeLanguageIds: ["typescript"]
    }
  }),
  createLanguage(require("linguist-languages/data/TSX"), {
    override: {
      since: "1.4.0",
      parsers: ["typescript"],
      vscodeLanguageIds: ["typescriptreact"]
    }
  }),
  createLanguage(require("linguist-languages/data/JSON"), {
    override: {
      name: "JSON.stringify",
      since: "1.13.0",
      parsers: ["json-stringify"],
      vscodeLanguageIds: ["json"],
      extensions: [], // .json file defaults to json instead of json-stringify
      filenames: ["package.json", "package-lock.json", "composer.json"]
    }
  }),
  createLanguage(require("linguist-languages/data/JSON"), {
    override: {
      since: "1.5.0",
      parsers: ["json"],
      vscodeLanguageIds: ["json"]
    },
    extend: {
      filenames: [".prettierrc"]
    }
  }),
  createLanguage(require("linguist-languages/data/JSON with Comments"), {
    override: {
      since: "1.5.0",
      parsers: ["json"],
      vscodeLanguageIds: ["jsonc"]
    },
    extend: {
      filenames: [".eslintrc"]
    }
  }),
  createLanguage(require("linguist-languages/data/JSON5"), {
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
