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
  },
  plugins: ["compat"],
  rules: {
    "compat/compat": "error",
  },
};
