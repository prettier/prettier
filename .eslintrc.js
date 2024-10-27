"use strict";
const { isCI } = require("ci-info");

module.exports = {
  root: true,
  env: {
    es2020: true,
    node: true,
  },
  extends: ["eslint:recommended", "prettier"],
  plugins: ["prettier-internal-rules", "import", "regexp", "unicorn"],
  settings: {
    "import/internal-regex": "^linguist-languages/",
  },
  rules: {
    "arrow-body-style": ["error", "as-needed"],
    curly: "error",
    "dot-notation": "error",
    eqeqeq: "error",
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["tests*/**", "scripts/**"],
      },
    ],
    "import/order": "error",
    "no-console": isCI ? "error" : "off",
    "no-else-return": [
      "error",
      {
        allowElseIf: false,
      },
    ],
    "no-implicit-coercion": "error",
    "no-inner-declarations": "error",
    "no-restricted-syntax": [
      "error",
      // `!foo === bar` and `!foo !== bar`
      'BinaryExpression[operator=/^[!=]==$/] > UnaryExpression.left[operator="!"]',
    ],
    "no-return-await": "error",
    "no-unneeded-ternary": "error",
    "no-useless-return": "error",
    "no-unused-vars": [
      "error",
      {
        ignoreRestSiblings: true,
      },
    ],
    "no-var": "error",
    "object-shorthand": "error",
    "one-var": ["error", "never"],
    "prefer-arrow-callback": "error",
    "prefer-const": [
      "error",
      {
        destructuring: "all",
      },
    ],
    "prefer-destructuring": [
      "error",
      {
        VariableDeclarator: {
          array: false,
          object: true,
        },
        AssignmentExpression: {
          array: false,
          object: false,
        },
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
    "prefer-object-spread": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "prettier-internal-rules/jsx-identifier-case": "error",
    "prettier-internal-rules/require-json-extensions": "error",
    "prettier-internal-rules/no-identifier-n": "error",
    quotes: [
      "error",
      "double",
      {
        avoidEscape: true,
      },
    ],
    "require-await": "error",
    strict: "error",
    "symbol-description": "error",
    yoda: [
      "error",
      "never",
      {
        exceptRange: true,
      },
    ],
    "regexp/match-any": [
      "error",
      {
        allows: ["dotAll"],
      },
    ],
    "regexp/no-useless-flag": "error",
    "unicorn/better-regex": "error",
    "unicorn/explicit-length-check": "error",
    "unicorn/new-for-builtins": "error",
    "unicorn/no-array-for-each": "error",
    "unicorn/no-array-push-push": "error",
    "unicorn/no-useless-undefined": "error",
    "unicorn/prefer-array-flat": [
      "error",
      {
        functions: ["flat", "flatten"],
      },
    ],
    "unicorn/prefer-array-flat-map": "error",
    "unicorn/prefer-includes": "error",
    "unicorn/prefer-number-properties": "error",
    "unicorn/prefer-optional-catch-binding": "error",
    "unicorn/prefer-regexp-test": "error",
    "unicorn/prefer-spread": "error",
    "unicorn/prefer-string-slice": "error",
  },
  overrides: [
    {
      files: ["scripts/**/*.js", "scripts/**/*.mjs"],
      rules: {
        "no-console": "off",
      },
    },
    {
      files: ["**/*.mjs"],
      parserOptions: {
        sourceType: "module",
      },
      rules: {
        "unicorn/prefer-module": "error",
        "unicorn/prefer-node-protocol": "error",
      },
    },
    {
      files: [
        "tests/format/**/jsfmt.spec.js",
        "tests/config/**/*.js",
        "tests/integration/**/*.js",
      ],
      env: {
        jest: true,
      },
      plugins: ["jest"],
      rules: {
        "jest/valid-expect": [
          "error",
          {
            alwaysAwait: true,
          },
        ],
      },
    },
    {
      files: ["tests/**/*.js"],
      rules: {
        strict: "off",
        "unicorn/prefer-array-flat": "off",
        "unicorn/prefer-array-flat-map": "off",
      },
      globals: {
        run_spec: false,
      },
    },
    {
      files: ["src/cli/**/*.js"],
      rules: {
        "no-restricted-modules": [
          "error",
          {
            patterns: [".."],
          },
        ],
      },
    },
    {
      files: "src/language-js/needs-parens.js",
      rules: {
        "prettier-internal-rules/better-parent-property-check-in-needs-parens":
          "error",
      },
    },
    {
      files: "src/**/*.js",
      rules: {
        "prettier-internal-rules/consistent-negative-index-access": "error",
        "prettier-internal-rules/flat-ast-path-call": "error",
        "prettier-internal-rules/no-conflicting-comment-check-flags": "error",
        "prettier-internal-rules/no-doc-builder-concat": "error",
        "prettier-internal-rules/no-empty-flat-contents-for-if-break": "error",
        "prettier-internal-rules/no-unnecessary-ast-path-call": "error",
        "prettier-internal-rules/prefer-ast-path-each": "error",
        "prettier-internal-rules/prefer-indent-if-break": "error",
        "prettier-internal-rules/prefer-is-non-empty-array": "error",
      },
    },
    {
      files: ["src/language-*/**/*.js"],
      rules: {
        "prettier-internal-rules/directly-loc-start-end": "error",
      },
    },
    {
      files: ["src/language-js/**/*.js"],
      rules: {
        "prettier-internal-rules/no-node-comments": [
          "error",
          {
            file: "src/language-js/utils.js",
            functions: ["hasComment", "getComments"],
          },
          "src/language-js/parse-postprocess.js",
          "src/language-js/parser-babel.js",
          "src/language-js/parser-meriyah.js",
          "src/language-js/pragma.js",
          "src/language-js/parser/json.js",
        ],
      },
    },
  ],
};
