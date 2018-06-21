"use strict";

const printer = require("./printer-yaml");
const options = require("./options");

const language = {
  name: "YAML",
  parsers: ["yaml"],
  vscodeLanguageIds: ["yaml"],
  // https://github.com/github/linguist/blob/master/lib/linguist/languages.yml
  aceMode: "yaml",
  aliases: ["yml"],
  codemirrorMimeType: "text/x-yaml",
  codemirrorMode: "yaml",
  extensions: [
    ".yml",
    ".reek",
    ".rviz",
    ".sublime-syntax",
    ".syntax",
    ".yaml",
    ".yaml-tmlanguage",
    ".yml.mysql"
  ],
  filenames: [".clang-format", ".clang-tidy", ".gemrc"],
  linguistLanguageId: 407,
  tmScope: "source.yaml"
};

module.exports = {
  languages: [language],
  printers: { yaml: printer },
  options
};
