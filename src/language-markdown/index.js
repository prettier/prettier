"use strict";

const printer = require("./printer-markdown");
const options = require("./options");
const createLanguage = require("../utils/create-language");

const languages = [
  createLanguage(require("linguist-languages/data/markdown"), {
    override: {
      since: "1.8.0",
      parsers: ["remark"],
      vscodeLanguageIds: ["markdown"]
    },
    extend: {
      filenames: ["README"]
    }
  }),
  createLanguage(
    { name: "MDX", extensions: [".mdx"] }, // TODO: use linguist data
    {
      override: {
        since: "1.15.0",
        parsers: ["mdx"],
        vscodeLanguageIds: ["mdx"]
      }
    }
  )
];

const printers = {
  mdast: printer
};

module.exports = {
  languages,
  options,
  printers
};
