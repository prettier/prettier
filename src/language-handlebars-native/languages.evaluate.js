import * as linguistLanguages from "linguist-languages";
import createLanguage from "../utils/create-language.js";

const languages = [
  createLanguage(linguistLanguages.Handlebars, () => ({
    parsers: ["handlebars"],
    vscodeLanguageIds: ["handlebars"],
  })),
];

export default languages;
