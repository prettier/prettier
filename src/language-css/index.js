import { createRequire } from "node:module";
import createLanguage from "../utils/create-language.js";
import printer from "./printer-postcss.js";
import options from "./options.js";
import parsers from "./parsers.js";

const require = createRequire(import.meta.url);

const languages = [
  createLanguage(require("linguist-languages/data/CSS.json"), (data) => ({
    since: "1.4.0",
    parsers: ["css"],
    vscodeLanguageIds: ["css"],
    extensions: [
      ...data.extensions,
      // `WeiXin Style Sheets`(Weixin Mini Programs)
      // https://developers.weixin.qq.com/miniprogram/en/dev/framework/view/wxs/
      ".wxss",
    ],
  })),
  createLanguage(require("linguist-languages/data/PostCSS.json"), () => ({
    since: "1.4.0",
    parsers: ["css"],
    vscodeLanguageIds: ["postcss"],
  })),
  createLanguage(require("linguist-languages/data/Less.json"), () => ({
    since: "1.4.0",
    parsers: ["less"],
    vscodeLanguageIds: ["less"],
  })),
  createLanguage(require("linguist-languages/data/SCSS.json"), () => ({
    since: "1.4.0",
    parsers: ["scss"],
    vscodeLanguageIds: ["scss"],
  })),
];

const printers = {
  postcss: printer,
};

const language = {
  languages,
  options,
  printers,
  parsers,
};

export default language;
