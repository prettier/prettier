"use strict";

module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: ["eslint:recommended"],
  plugins: ["prettier"],
  rules: {
    "no-console": "off",
    "no-inner-declarations": "off",
    "no-var": "error",
    "prefer-arrow-callback": "error",
    "prefer-const": "error",
    "prettier/prettier": "error",
    strict: "error"
  }
};
