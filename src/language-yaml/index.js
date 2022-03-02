import { createRequire } from "node:module";
import createLanguage from "../utils/create-language.js";
import printer from "./printer-yaml.js";
import options from "./options.js";
import parsers from "./parsers.js";

const require = createRequire(import.meta.url);

const languages = [
  createLanguage(require("linguist-languages/data/YAML.json"), (data) => ({
    since: "1.14.0",
    parsers: ["yaml"],
    vscodeLanguageIds: ["yaml", "ansible", "home-assistant"],
    // yarn.lock is not YAML: https://github.com/yarnpkg/yarn/issues/5629
    filenames: [
      ...data.filenames.filter((filename) => filename !== "yarn.lock"),
      ".prettierrc",
      ".stylelintrc",
    ],
  })),
];

const language = {
  languages,
  printers: { yaml: printer },
  options,
  parsers,
};

export default language;
