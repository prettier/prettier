import linguistLanguages from "linguist-languages";
import createLanguage from "../utils/create-language.js";

const languages = [
  createLanguage(linguistLanguages.CSS, (data) => ({
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
  createLanguage(linguistLanguages.PostCSS, () => ({
    since: "1.4.0",
    parsers: ["css"],
    vscodeLanguageIds: ["postcss"],
  })),
  createLanguage(linguistLanguages.Less, () => ({
    since: "1.4.0",
    parsers: ["less"],
    vscodeLanguageIds: ["less"],
  })),
  createLanguage(linguistLanguages.SCSS, () => ({
    since: "1.4.0",
    parsers: ["scss"],
    vscodeLanguageIds: ["scss"],
  })),
];

export default languages;
