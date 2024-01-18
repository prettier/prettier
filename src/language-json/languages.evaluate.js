import linguistLanguages from "linguist-languages";

import createLanguage from "../utils/create-language.js";

const languages = [
  createLanguage(linguistLanguages.JSON, () => ({
    name: "JSON.stringify",
    parsers: ["json-stringify"],
    vscodeLanguageIds: ["json"],
    extensions: [".importmap"], // .json file defaults to json instead of json-stringify
    filenames: ["package.json", "package-lock.json", "composer.json"],
  })),
  createLanguage(linguistLanguages.JSON, (data) => ({
    parsers: ["json"],
    vscodeLanguageIds: ["json"],
    extensions: data.extensions.filter((extension) => extension !== ".jsonl"),
    filenames: [
      ...data.filenames,
      ".babelrc",
      ".jscsrc",
      ".jshintrc",
      ".jslintrc",
      ".swcrc",
    ],
  })),
  createLanguage(linguistLanguages["JSON with Comments"], () => ({
    parsers: ["jsonc"],
    vscodeLanguageIds: ["jsonc"],
    // Too many filenames from `linguist-languages` are not a valid JSONC files.
    // https://github.com/prettier/prettier/issues/15945#issuecomment-1895371835
    filenames: [
      "devcontainer.json",
      "jsconfig.json",
      "language-configuration.json",
    ],
  })),
  createLanguage(linguistLanguages.JSON5, () => ({
    parsers: ["json5"],
    vscodeLanguageIds: ["json5"],
  })),
];

export default languages;
