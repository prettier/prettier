import linguistLanguages from "linguist-languages";
import createLanguage from "../utils/create-language.js";

const languages = [
  createLanguage(linguistLanguages.GraphQL, () => ({
    parsers: ["graphql"],
    vscodeLanguageIds: ["graphql"],
  })),
];

export default languages;
