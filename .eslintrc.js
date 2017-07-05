"use strict";

module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: ["eslint:recommended", "plugin:react/recommended"],
  plugins: ["prettier", "react", "import"],
  rules: {
    curly: "error",
    "import/no-extraneous-dependencies": [
      "error",
      { devDependencies: ["tests*/**", "scripts/**"] }
    ],
    "no-console": "off",
    "no-else-return": "error",
    "no-inner-declarations": "off",
    "no-useless-return": "error",
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
