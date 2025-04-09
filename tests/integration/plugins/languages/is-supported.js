// @ts-check

/** @import {SupportLanguage} from "prettier" */

/** @type {SupportLanguage[]} */
export const languages = [
  {
    name: "language-name-does-not-matter",
    parsers: ["parser-name-inferred-from-language-is-supported"],
    isSupported: (file) =>
      /^\.husky[\\/][^\\/]+/u.test(file) ||
      /([\\/])\.husky\1[^\\/]+$/u.test(file),
  },
];
