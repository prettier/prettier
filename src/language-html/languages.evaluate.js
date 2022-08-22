import linguistLanguages from "linguist-languages";
import { createLanguage } from "../utils/index.js";

const languages = [
  createLanguage(linguistLanguages.HTML, () => ({
    name: "Angular",
    since: "1.15.0",
    parsers: ["angular"],
    vscodeLanguageIds: ["html"],
    extensions: [".component.html"],
    filenames: [],
  })),
  createLanguage(linguistLanguages.HTML, (data) => ({
    since: "1.15.0",
    parsers: ["html"],
    vscodeLanguageIds: ["html"],
    extensions: [
      ...data.extensions,
      ".mjml", // MJML is considered XML in Linguist but it should be formatted as HTML
    ],
  })),
  createLanguage(linguistLanguages.HTML, () => ({
    name: "Lightning Web Components",
    since: "1.17.0",
    parsers: ["lwc"],
    vscodeLanguageIds: ["html"],
    extensions: [],
    filenames: [],
  })),
  createLanguage(linguistLanguages.Vue, () => ({
    since: "1.10.0",
    parsers: ["vue"],
    vscodeLanguageIds: ["vue"],
  })),
];

export default languages;
