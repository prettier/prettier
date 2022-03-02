"use strict";
const { isCI } = require("ci-info");

module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  reportUnusedDisableDirectives: true,
  extends: ["eslint:recommended", "prettier"],
  plugins: [
    "prettier-internal-rules",
    "import",
    "regexp",
    "unicorn",
    "@typescript-eslint",
  ],
  settings: {
    "import/internal-regex": "^linguist-languages/",
  },
  rules: {
    "@typescript-eslint/prefer-ts-expect-error": "error",
    "arrow-body-style": ["error", "as-needed"],
    curly: "error",
    "dot-notation": "error",
    eqeqeq: "error",
    "no-console": isCI ? "error" : "warn",
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
      // `(() => (foo ? bar : baz))()`
      // TODO: Remove this when https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1730 get implemented
      'CallExpression[callee.type="ArrowFunctionExpression"][callee.body.type="ConditionalExpression"]',
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
    "prettier-internal-rules/no-identifier-n": "error",
    quotes: [
      "error",
      "double",
      {
        avoidEscape: true,
      },
    ],
    "require-await": "error",
    "symbol-description": "error",
    yoda: [
      "error",
      "never",
      {
        exceptRange: true,
      },
    ],

    "import/extensions": ["error", "ignorePackages"],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["jest.config.mjs", "tests/**", "scripts/**"],
      },
    ],
    "import/order": "error",
    "import/no-anonymous-default-export": "error",

    "regexp/match-any": [
      "error",
      {
        allows: ["dotAll"],
      },
    ],
    "regexp/no-unused-capturing-group": "error",
    "regexp/no-useless-flag": [
      "error",
      {
        strictTypes: false,
      },
    ],
    "regexp/no-useless-lazy": "error",

    "unicorn/better-regex": "error",
    "unicorn/explicit-length-check": "error",
    "unicorn/filename-case": "error",
    "unicorn/new-for-builtins": "error",
    "unicorn/no-array-for-each": "error",
    "unicorn/no-array-push-push": "error",
    "unicorn/no-new-array": "error",
    "unicorn/no-useless-length-check": "error",
    "unicorn/no-useless-promise-resolve-reject": "error",
    "unicorn/no-useless-undefined": "error",
    "unicorn/prefer-array-flat": [
      "error",
      {
        functions: ["flat", "flatten"],
      },
    ],
    "unicorn/prefer-array-flat-map": "error",
    "unicorn/prefer-array-some": "error",
    "unicorn/prefer-includes": "error",
    "unicorn/prefer-json-parse-buffer": "error",
    "unicorn/prefer-module": "error",
    "unicorn/prefer-node-protocol": "error",
    "unicorn/prefer-number-properties": "error",
    "unicorn/prefer-optional-catch-binding": "error",
    "unicorn/prefer-regexp-test": "error",
    "unicorn/prefer-spread": "error",
    "unicorn/prefer-string-slice": "error",
    "unicorn/prefer-string-starts-ends-with": "error",
    "unicorn/prefer-switch": "error",
    "unicorn/prefer-type-error": "error",
  },
  overrides: [
    {
      files: [
        "scripts/**/*.js",
        "scripts/**/*.cjs",
        "scripts/**/*.mjs",
        "tests/config/install-prettier.js",
      ],
      rules: {
        "no-console": "off",
      },
    },
    // CommonJS modules
    {
      files: [
        "**/*.cjs",
        "scripts/tools/eslint-plugin-prettier-internal-rules/**/*.js",
        "website/**/*.js",
        "tests/integration/plugins/automatic/prettier-plugin-bar.js",
      ],
      parserOptions: {
        sourceType: "script",
      },
      rules: {
        strict: "error",
        "unicorn/prefer-module": "off",
      },
    },
    {
      files: [
        "tests/format/**/jsfmt.spec.js",
        "tests/config/**/*.js",
        "tests/integration/**/*.js",
        "scripts/release/__tests__/**/*.spec.js",
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
        "jest/prefer-to-be": "error",
      },
    },
    {
      files: ["tests/format/**/*.js"],
      rules: {
        "prettier-internal-rules/no-legacy-format-test-fixtures": "error",
      },
    },
    {
      files: ["tests/integration/**/*.js"],
      rules: {
        "prettier-internal-rules/await-cli-tests": "error",
      },
    },
    {
      files: ["tests/**/*.js"],
      rules: {
        "import/no-extraneous-dependencies": "off",
        "unicorn/prefer-array-flat": "off",
        "unicorn/prefer-array-flat-map": "off",
      },
      globals: {
        run_spec: false,
      },
    },
    {
      files: ["src/cli/*.js"],
      rules: {
        // TODO[@fisker]: This not actually working, need fix. #11903
        "no-restricted-modules": [
          "error",
          {
            patterns: ["../"],
          },
        ],
      },
    },
    {
      files: ["src/cli/*/*.js"],
      rules: {
        "no-restricted-modules": [
          "error",
          {
            patterns: ["../../"],
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
            file: "src/language-js/utils/index.js",
            functions: ["hasComment", "getComments"],
          },
          "src/language-js/pragma.js",
          "src/language-js/parse/postprocess/*.js",
          "src/language-js/parse/babel.js",
          "src/language-js/parse/meriyah.js",
          "src/language-js/parse/json.js",
          "src/language-js/parse/acorn.js",
        ],
      },
    },
    {
      files: ["website/**/*"],
      env: {
        browser: true,
        worker: true,
      },
      extends: ["plugin:react/recommended"],
      settings: {
        react: {
          version: "17",
        },
      },
      rules: {
        "import/no-extraneous-dependencies": "off",
        "react/display-name": "off",
        "react/no-deprecated": "off",
        "react/prop-types": "off",
        "unicorn/filename-case": "off",
      },
    },
    {
      files: ["website/playground/**/*"],
      parserOptions: {
        sourceType: "module",
      },
    },
    {
      files: ["scripts/tools/eslint-plugin-prettier-internal-rules/**/*.js"],
      rules: {
        "import/no-extraneous-dependencies": "error",
      },
    },
  ],
};
