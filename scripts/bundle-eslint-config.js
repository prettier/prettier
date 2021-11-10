"use strict";

const targets = require("../package.json").browserslist;

module.exports = {
  root: true,
  env: {
    browser: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
  },
  settings: {
    targets,
    lintAllEsApis: true,
    polyfills: [
      // These are not really polyfilled, but seems safe to use in target browsers
      "BigInt",
      "Symbol.asyncIterator",
    ],
  },
  plugins: ["compat"],
  rules: {
    "compat/compat": "error",
  },
};
