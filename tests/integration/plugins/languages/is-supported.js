// @ts-check

import path from "node:path";

/** @import {SupportLanguage} from "prettier" */

/** @type {SupportLanguage[]} */
export const languages = [
  {
    name: "language-name-does-not-matter",
    parsers: ["parser-name-inferred-from-language-is-supported"],
    isSupported(file) {
      if (!path.isAbsolute(file)) {
        throw new Error("Unexpected non absolute path");
      }

      return /(?<separator>[\\/])\.husky\k<separator>[^\\/]+$/u.test(file);
    },
  },
];
