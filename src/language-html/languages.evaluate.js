import * as linguistLanguages from "linguist-languages";
import createLanguage from "../utils/create-language.js";

const languages = [
  createLanguage(linguistLanguages.HTML, () => ({
    name: "Angular",
    parsers: ["angular"],
    vscodeLanguageIds: ["html"],
    extensions: [".component.html"],
    filenames: [],
  })),
  createLanguage(linguistLanguages.HTML, () => ({
    parsers: ["html"],
    vscodeLanguageIds: ["html"],
  })),
  createLanguage(linguistLanguages.HTML, () => ({
    name: "Lightning Web Components",
    parsers: ["lwc"],
    vscodeLanguageIds: ["html"],
    extensions: [],
    filenames: [],
  })),
  createLanguage(linguistLanguages.HTML, () => ({
    name: "MJML",
    parsers: ["mjml"],
    extensions: [".mjml"],
    filenames: [],
    // https://github.com/mjmlio/vscode-mjml/blob/477f030d400fe838d29495f4a432fba57f2198b7/package.json#L226-L238
    vscodeLanguageIds: ["mjml"],
    aliases: ["MJML", "mjml"],
    // https://github.com/mjmlio/vscode-mjml/blob/477f030d400fe838d29495f4a432fba57f2198b7/package.json#L242
    tmScope: "text.mjml.basic",
  })),
  createLanguage(linguistLanguages.Vue, () => ({
    parsers: ["vue"],
    vscodeLanguageIds: ["vue"],
  })),
];

export default languages;
