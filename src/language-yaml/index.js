"use strict";

const createLanguage = require("../utils/create-language.js");
const printer = require("./printer-yaml.js");
const options = require("./options.js");
const parsers = require("./parsers.js");

const languages = [
  createLanguage(require("linguist-languages/data/YAML.json"), (data) => ({
    since: "1.14.0",
    parsers: ["yaml"],
    vscodeLanguageIds: ["yaml", "ansible", "home-assistant"],
    // yarn.lock is not YAML: https://github.com/yarnpkg/yarn/issues/5629
    filenames: [
      ...data.filenames.filter((filename) => filename !== "yarn.lock"),
      ".prettierrc",
      ".stylelintrc",
      ".lintstagedrc",
    ],
  })),
];

module.exports = {
  languages,
  printers: { yaml: printer },
  options,
  parsers,
};
