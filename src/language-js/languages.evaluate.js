import linguistLanguages from "linguist-languages";
import createLanguage from "../utils/create-language.js";

const languages = [
  createLanguage(linguistLanguages.JavaScript, (data) => ({
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
  })),
  createLanguage(linguistLanguages.JavaScript, () => ({
    name: "Flow",
    since: "0.0.0",
    parsers: ["flow", "babel-flow"],
    vscodeLanguageIds: ["javascript"],
    aliases: [],
    filenames: [],
    extensions: [".js.flow"],
  })),
  createLanguage(linguistLanguages.JavaScript, () => ({
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
  createLanguage(linguistLanguages.TypeScript, (data) => ({
    since: "1.4.0",
    parsers: ["typescript", "babel-ts"],
    vscodeLanguageIds: ["typescript"],
  })),
  createLanguage(linguistLanguages.TSX, () => ({
    since: "1.4.0",
    parsers: ["typescript", "babel-ts"],
    vscodeLanguageIds: ["typescriptreact"],
  })),
  createLanguage(linguistLanguages.JSON, () => ({
    name: "JSON.stringify",
    since: "1.13.0",
    parsers: ["json-stringify"],
    vscodeLanguageIds: ["json"],
    extensions: [".importmap"], // .json file defaults to json instead of json-stringify
    filenames: ["package.json", "package-lock.json", "composer.json"],
  })),
  createLanguage(linguistLanguages.JSON, (data) => ({
    since: "1.5.0",
    parsers: ["json"],
    vscodeLanguageIds: ["json"],
    extensions: data.extensions.filter((extension) => extension !== ".jsonl"),
  })),
  createLanguage(linguistLanguages["JSON with Comments"], (data) => ({
    since: "1.5.0",
    parsers: ["json"],
    vscodeLanguageIds: ["jsonc"],
    filenames: [...data.filenames, ".eslintrc", ".swcrc"],
  })),
  createLanguage(linguistLanguages.JSON5, () => ({
    since: "1.13.0",
    parsers: ["json5"],
    vscodeLanguageIds: ["json5"],
  })),
];

export default languages;
