"use strict";

module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: ["eslint:recommended"],
  plugins: ["prettier"],
  rules: {
    curly: "error",
    "no-console": "off",
    "no-else-return": "error",
    "no-inner-declarations": "off",
    "no-var": "error",
    "prefer-arrow-callback": "error",
    "prefer-const": "error",
    "prettier/prettier": "error",
    strict: "error"
  }
};
