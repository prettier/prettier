import * as linguistLanguages from "linguist-languages";
import createLanguage from "../utils/create-language.js";

const languages = [
  createLanguage(linguistLanguages.SCSS, (data) => ({
    parsers: ["sassparser"],
    vscodeLanguageIds: ["scss"],
    extensions: [...data.extensions, ".sassparser"],
  })),
];

export default languages;
