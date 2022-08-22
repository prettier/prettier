import linguistLanguages from "linguist-languages";
import { createLanguage } from "../utils/index.js";

const languages = [
  createLanguage(linguistLanguages.GraphQL, () => ({
    since: "1.5.0",
    parsers: ["graphql"],
    vscodeLanguageIds: ["graphql"],
  })),
];

export default languages;
