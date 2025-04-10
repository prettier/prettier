// @ts-check

/** @import {SupportLanguage} from "prettier" */

/** @type {SupportLanguage[]} */
export const languages = [
  {
    name: "language-name-does-not-matter",
    parsers: ["parser-name-inferred-from-language-is-supported"],
    isSupported: (file) =>
      /(?<separator>[\\/])\.husky\k<separator>[^\\/]+$/u.test(file),
  },
];
