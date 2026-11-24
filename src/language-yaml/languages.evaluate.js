import * as linguistLanguages from "linguist-languages";
import createLanguage from "../utilities/create-language.js";

const ignoredFilenames = new Set([
  // `yarn.lock` is not YAML in Yarn v1: https://github.com/yarnpkg/yarn/issues/5629
  // and it's a generated file, we don't want format it by default
  "yarn.lock",
  // `.eslintrc` can be JSON with comments (JSONC) or YAML, so don't infer a parser by default
  ".eslintrc",
]);

const languages = [
  createLanguage(linguistLanguages.YAML, (data) => ({
    parsers: ["yaml"],
    vscodeLanguageIds: [
      "yaml",
      "ansible",
      "dockercompose",
      "github-actions-workflow",
      "home-assistant",
    ],
    filenames: [
      ...data.filenames.filter((filename) => !ignoredFilenames.has(filename)),
      ".prettierrc",
      ".stylelintrc",
      ".lintstagedrc",
    ],
  })),
];

export default languages;
