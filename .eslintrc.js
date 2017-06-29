"use strict";

module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: ["eslint:recommended", "plugin:react/recommended"],
  plugins: ["prettier", "react"],
  rules: {
    curly: "error",
    "no-console": "off",
    "no-else-return": "error",
    "no-inner-declarations": "off",
    "no-var": "error",
    "prefer-arrow-callback": "error",
    "prefer-const": "error",
    "prettier/prettier": "error",
    "react/no-deprecated": "off",
    strict: "error"
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  }
};
