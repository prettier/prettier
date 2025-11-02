import * as linguistLanguages from "linguist-languages";
import createLanguage from "../utils/create-language.js";

const languages = [
  createLanguage(linguistLanguages.JavaScript, (data) => ({
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
      ...data.extensions.filter(
        (extension) => extension !== ".jsx" && extension !== ".frag",
      ),
      // https://github.com/github-linguist/linguist/issues/7232#issuecomment-2646876469
      ".start.frag",
      ".end.frag",
      // WeiXin Script (Weixin Mini Programs)
      // https://developers.weixin.qq.com/miniprogram/en/dev/framework/view/wxs/
      ".wxs",
    ],
    filenames: [
      ...data.filenames,
      // https://github.com/github-linguist/linguist/issues/7232#issuecomment-2646876469
      "start.frag",
      "end.frag",
    ],
  })),
  createLanguage(linguistLanguages.JavaScript, () => ({
    name: "Flow",
    parsers: ["flow", "babel-flow"],
    vscodeLanguageIds: ["javascript"],
    aliases: [],
    filenames: [],
    extensions: [".js.flow"],
  })),
  createLanguage(linguistLanguages.JavaScript, () => ({
    name: "JSX",
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
  createLanguage(linguistLanguages.TypeScript, () => ({
    parsers: ["typescript", "babel-ts"],
    vscodeLanguageIds: ["typescript"],
  })),
  createLanguage(linguistLanguages.TSX, () => ({
    parsers: ["typescript", "babel-ts"],
    vscodeLanguageIds: ["typescriptreact"],
  })),
];

export default languages;
