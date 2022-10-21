import linguistLanguages from "linguist-languages";
import createLanguage from "../utils/create-language.js";

const languages = [
  createLanguage(linguistLanguages.HTML, () => ({
    name: "Angular",
    parsers: ["angular"],
    vscodeLanguageIds: ["html"],
    extensions: [".component.html"],
    filenames: [],
  })),
  createLanguage(linguistLanguages.HTML, (data) => ({
    parsers: ["html"],
    vscodeLanguageIds: ["html"],
    extensions: [
      ...data.extensions,
      ".mjml", // MJML is considered XML in Linguist but it should be formatted as HTML
    ],
  })),
  createLanguage(linguistLanguages.HTML, () => ({
    name: "Lightning Web Components",
    parsers: ["lwc"],
    vscodeLanguageIds: ["html"],
    extensions: [],
    filenames: [],
  })),
  createLanguage(linguistLanguages.Vue, () => ({
    parsers: ["vue"],
    vscodeLanguageIds: ["vue"],
  })),
];

export default languages;
