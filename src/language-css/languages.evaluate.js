import linguistLanguages from "linguist-languages";
import createLanguage from "../utils/create-language.js";

const languages = [
  createLanguage(linguistLanguages.CSS, (data) => ({
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
    parsers: ["css"],
    vscodeLanguageIds: ["postcss"],
  })),
  createLanguage(linguistLanguages.Less, () => ({
    parsers: ["less"],
    vscodeLanguageIds: ["less"],
  })),
  createLanguage(linguistLanguages.SCSS, () => ({
    parsers: ["scss"],
    vscodeLanguageIds: ["scss"],
  })),
];

export default languages;
