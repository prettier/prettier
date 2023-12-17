"use strict";
const path = require("node:path");
const { isCI } = require("ci-info");

module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:regexp/recommended",
    "plugin:unicorn/recommended",
  ],
  plugins: [
    "prettier-internal-rules",
    "import",
    "n",
    "regexp",
    "unicorn",
    "@typescript-eslint",
    "simple-import-sort",
  ],
  rules: {
    "arrow-body-style": ["error", "as-needed"],
    curly: "error",
    "dot-notation": "error",
    eqeqeq: "error",
    "logical-assignment-operators": "error",
    "no-console": isCI ? "error" : "warn",
    "no-constant-binary-expression": "error",
    "no-duplicate-imports": "error",
    "no-else-return": [
      "error",
      {
        allowElseIf: false,
      },
    ],
    "no-implicit-coercion": "error",
    "no-inner-declarations": "error",
    "no-lonely-if": "error",
    "no-restricted-syntax": [
      "error",
      // `!foo === bar` and `!foo !== bar`
      'BinaryExpression[operator=/^[!=]==$/] > UnaryExpression.left[operator="!"]',
    ],
    "no-return-await": "error",
    "no-unneeded-ternary": "error",
    "no-useless-return": "error",
    "no-unused-expressions": [
      "error",
      {
        allowShortCircuit: true,
        allowTernary: true,
      },
    ],
    "no-unused-vars": [
      "error",
      {
        ignoreRestSiblings: true,
      },
    ],
    "no-var": "error",
    "object-shorthand": [
      "error",
      "always",
      {
        avoidExplicitReturnArrows: true,
      },
    ],
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
    "prefer-object-has-own": "error",
    "prefer-object-spread": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
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

    // Internal rules
    "prettier-internal-rules/jsx-identifier-case": "error",
    "prettier-internal-rules/no-identifier-n": "error",
    "prettier-internal-rules/prefer-fs-promises-submodule": "error",

    // @typescript-eslint/eslint-plugin
    "@typescript-eslint/prefer-ts-expect-error": "error",

    // eslint-plugin-import
    "import/extensions": ["error", "ignorePackages"],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "jest.config.js",
          "tests/**",
          "scripts/**",
          "website/**/*",
        ],
      },
    ],
    "import/no-anonymous-default-export": [
      "error",
      {
        allowArray: true,
        allowArrowFunction: true,
        allowAnonymousClass: false,
        allowAnonymousFunction: false,
        allowCallExpression: true,
        // Unreleased
        // allowNew: true,
        allowLiteral: true,
        allowObject: true,
      },
    ],

    // eslint-plugin-n
    "n/no-path-concat": "error",

    // eslint-plugin-regexp
    "regexp/match-any": [
      "error",
      {
        allows: ["dotAll"],
      },
    ],
    /* cspell:disable-next-line */
    "regexp/no-extra-lookaround-assertions": "error",
    "regexp/no-missing-g-flag": "error",
    "regexp/no-useless-flag": [
      "error",
      {
        strictTypes: false,
      },
    ],
    /* cspell:disable-next-line */
    "regexp/prefer-lookaround": [
      "error",
      {
        strictTypes: false,
      },
    ],
    // Conflicting with `unicorn/better-regex`
    "regexp/strict": "off",
    // Hard to fix
    "regexp/no-empty-alternative": "off",
    "regexp/no-super-linear-backtracking": "off",

    "simple-import-sort/imports": isCI ? "error" : "warn",
    "simple-import-sort/exports": isCI ? "error" : "warn",

    // eslint-plugin-unicorn
    "unicorn/escape-case": "off",
    "unicorn/catch-error-name": "off",
    "unicorn/consistent-destructuring": "off",
    "unicorn/consistent-function-scoping": "off",
    "unicorn/import-style": "off",
    "unicorn/no-array-callback-reference": "off",
    "unicorn/no-array-method-this-argument": "off",
    "unicorn/no-array-reduce": "off",
    "unicorn/no-await-expression-member": "off",
    "unicorn/no-for-loop": "off",
    "unicorn/no-hex-escape": "off",
    "unicorn/no-negated-condition": "off",
    "unicorn/no-nested-ternary": "off",
    "unicorn/no-null": "off",
    "unicorn/no-process-exit": "off",
    "unicorn/no-thenable": "off",
    "unicorn/no-unreadable-array-destructuring": "off",
    "unicorn/no-useless-switch-case": "off",
    "unicorn/number-literal-case": "off",
    "unicorn/numeric-separators-style": "off",
    "unicorn/prefer-array-flat": [
      "error",
      {
        functions: ["flat", "flatten"],
      },
    ],
    "unicorn/prefer-add-event-listener": "off",
    "unicorn/prefer-at": [
      "error",
      {
        getLastElementFunctions: ["getLast"],
      },
    ],
    "unicorn/prefer-code-point": "off",
    "unicorn/prefer-dom-node-append": "off",
    "unicorn/prefer-dom-node-remove": "off",
    "unicorn/prefer-export-from": [
      "error",
      {
        ignoreUsedVariables: true,
      },
    ],
    "unicorn/prefer-query-selector": "off",
    "unicorn/prefer-ternary": "off",
    "unicorn/prevent-abbreviations": "off",
    "unicorn/relative-url-style": "off",
    "unicorn/switch-case-braces": ["error", "avoid"],
  },
  overrides: [
    // CommonJS modules
    {
      files: [
        "**/*.cjs",
        "scripts/tools/eslint-plugin-prettier-internal-rules/**/*.js",
        "website/**/*.js",
      ],
      parserOptions: {
        sourceType: "script",
      },
      rules: {
        strict: "error",
        "unicorn/prefer-module": "off",
        "unicorn/prefer-node-protocol": "off",
      },
    },
    {
      files: ["scripts/**/*", "tests/config/install-prettier.js"],
      rules: {
        "no-console": "off",
      },
    },
    {
      files: ["scripts/**/*.js"],
      rules: {
        "unicorn/prefer-top-level-await": "error",
      },
    },
    {
      files: [
        "tests/config/**/*.js",
        "tests/format/**/jsfmt.spec.js",
        "tests/integration/**/*.js",
        "tests/unit/**/*.js",
        "tests/dts/unit/**/*.js",
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
        // TODO: Enable this when we drop support for Node.js v14
        "logical-assignment-operators": "off",
        "unicorn/prefer-array-flat": "off",
        "unicorn/prefer-array-flat-map": "off",
        "unicorn/prefer-string-replace-all": "off",
      },
      globals: {
        run_spec: "readonly",
        runCli: "readonly",
      },
    },
    {
      files: ["src/cli/**/*.js"],
      rules: {
        "n/no-restricted-import": [
          "error",
          [
            {
              name: [
                path.resolve(__dirname, "src/**"),
                `!${path.resolve(__dirname, "src/cli/**")}`,
                `!${path.resolve(__dirname, "src/index.js")}`,
              ],
              message: "Don't use code from other directory.",
            },
          ],
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
        "prettier-internal-rules/flat-ast-path-call": "error",
        "prettier-internal-rules/no-conflicting-comment-check-flags": "error",
        "prettier-internal-rules/no-doc-public-import": "error",
        "prettier-internal-rules/no-empty-flat-contents-for-if-break": "error",
        "prettier-internal-rules/no-unnecessary-ast-path-call": "error",
        "prettier-internal-rules/prefer-ast-path-each": "error",
        "prettier-internal-rules/prefer-indent-if-break": "error",
        "prettier-internal-rules/prefer-is-non-empty-array": "error",
        "prettier-internal-rules/prefer-ast-path-getters": "error",
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
      excludedFiles: ["src/language-js/parse/postprocess/*.js"],
      rules: {
        "prettier-internal-rules/no-node-comments": [
          "error",
          {
            file: "src/language-js/utils/index.js",
            functions: ["hasComment", "getComments"],
          },
          "src/language-js/pragma.js",
          "src/language-js/parse/babel.js",
          "src/language-js/parse/meriyah.js",
          "src/language-js/parse/json.js",
          "src/language-js/parse/acorn.js",
          "src/language-js/parse/utils/wrap-babel-expression.js",
        ],
        "prettier-internal-rules/prefer-create-type-check-function": [
          "error",
          {
            ignoreSingleType: true,
            onlyTopLevelFunctions: true,
          },
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
          version: "18",
        },
      },
      rules: {
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
      files: ["bin/prettier.cjs"],
      parserOptions: {
        ecmaVersion: 5,
      },
      rules: {
        "no-var": "off",
        "prefer-arrow-callback": "off",
      },
    },
  ],
};
