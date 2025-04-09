// @ts-check

"use strict";

/** @import {Plugin} from "prettier" */

/** @type {Plugin<string>} */
const plugin = {
  languages: [
    {
      name: "husky",
      since: "0.17.2",
      parsers: ["foo"],
      vscodeLanguageIds: ["shellscript"],
      isSupported: (file) =>
        /^\.husky[\\/][^\\/]+/u.test(file) ||
        /([\\/])\.husky\1[^\\/]+$/u.test(file),
    },
  ],
  parsers: {
    foo: {
      parse: (text) => text,
      astFormat: "foo",
      locStart: () => 0,
      locEnd: (node) => node.length,
    },
  },
};

module.exports = plugin;
