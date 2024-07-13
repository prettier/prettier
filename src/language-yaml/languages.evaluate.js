import linguistLanguages from "linguist-languages";
import createLanguage from "../utils/create-language.js";

const languages = [
  createLanguage(linguistLanguages.YAML, (data) => ({
    parsers: ["yaml"],
    vscodeLanguageIds: ["yaml", "ansible", "home-assistant"],
    // yarn.lock is not YAML: https://github.com/yarnpkg/yarn/issues/5629
    filenames: [
      ...data.filenames.filter((filename) => filename !== "yarn.lock"),
      ".prettierrc",
      ".stylelintrc",
      ".lintstagedrc",
    ],
  })),
];

export default languages;
