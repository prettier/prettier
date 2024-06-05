import url from "node:url";

import { fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginJs from "@eslint/js";
import eslintPluginStylisticJs from "@stylistic/eslint-plugin-js";
import eslintPluginTypescriptEslint from "@typescript-eslint/eslint-plugin";
import { isCI } from "ci-info";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginJest from "eslint-plugin-jest";
import eslintPluginN from "eslint-plugin-n";
import eslintPluginReactConfigRecommended from "eslint-plugin-react/configs/recommended.js";
import eslintPluginRegexp from "eslint-plugin-regexp";
import eslintPluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import eslintPluginUnicorn from "eslint-plugin-unicorn";

import eslintPluginPrettierInternalRules from "./scripts/tools/eslint-plugin-prettier-internal-rules/index.js";

const toPath = (file) => url.fileURLToPath(new URL(file, import.meta.url));
const compat = new FlatCompat({ baseDirectory: toPath("./") });
eslintPluginReactConfigRecommended.plugins.react = fixupPluginRules(
  eslintPluginReactConfigRecommended.plugins.react,
);

const ignores = `
.tmp
# Ignore directories and files in 'tests/format'
tests/format/**/*
# Unignore directories and 'jsfmt.spec.js', 'format.test.js' file
!tests/format/**/
!tests/format/**/format.test.js
# TODO: Remove this in 2025
!tests/format/**/jsfmt.spec.js
tests/integration/cli/
test*.*
scripts/release/node_modules
coverage/
dist*/
**/node_modules/**
website/build/
website/static/playground.js
website/static/lib/
scripts/benchmark/*/
**/.yarn/**
**/.pnp.*
`
  .split("\n")
  .filter((pattern) => pattern && !pattern.startsWith("#"));

export default [
  eslintPluginJs.configs.recommended,
  eslintPluginRegexp.configs["flat/recommended"],
  eslintPluginUnicorn.configs["flat/recommended"],
  eslintConfigPrettier,
  ...compat.env({ es2024: true, node: true }),
  {
    plugins: {
      "@stylistic/js": eslintPluginStylisticJs,
      "@typescript-eslint": eslintPluginTypescriptEslint,
      import: eslintPluginImport,
      n: eslintPluginN,
      "prettier-internal-rules": eslintPluginPrettierInternalRules,
      "simple-import-sort": eslintPluginSimpleImportSort,
    },

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
      "prettier-internal-rules/massage-ast-parameter-names": "error",
      "prettier-internal-rules/no-identifier-n": "error",
      "prettier-internal-rules/prefer-fs-promises-submodule": "error",

      // @typescript-eslint/eslint-plugin
      "@typescript-eslint/prefer-ts-expect-error": "error",

      "@stylistic/js/quotes": [
        "error",
        "double",
        {
          avoidEscape: true,
        },
      ],

      // eslint-plugin-import
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: [
            "jest.config.js",
            "tests/**",
            "scripts/**",
            "website/**/*",
            "eslint.config.js",
          ],
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
      "regexp/unicode-property": [
        "error",
        {
          generalCategory: "never",
          key: "long",
          property: {
            binary: "long",
            generalCategory: "long",
            script: "long",
          },
        },
      ],

      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

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
      "unicorn/no-useless-undefined": [
        "error",
        {
          checkArrowFunctionBody: false,
        },
      ],
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

    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },
  {
    ignores,
  },
  // CommonJS modules
  {
    files: [
      "**/*.cjs",
      "scripts/tools/eslint-plugin-prettier-internal-rules/**/*.js",
      "website/**/*.js",
    ],
    languageOptions: {
      sourceType: "script",
    },
    rules: {
      strict: ["error", "global"],
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
      "tests/format/**/format.test.js",
      "tests/integration/**/*.js",
      "tests/unit/**/*.js",
      "tests/dts/unit/**/*.js",
      "scripts/release/__tests__/**/*.spec.js",
    ],
    plugins: { jest: eslintPluginJest },
    languageOptions: {
      globals: eslintPluginJest.environments.globals.globals,
    },
    rules: {
      "@stylistic/js/quotes": [
        "error",
        "double",
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
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
      "prettier-internal-rules/no-legacy-format-test": "error",
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
    languageOptions: {
      globals: {
        runCli: "readonly",
        runFormatTest: "readonly",
      },
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
              toPath("src/**"),
              `!${toPath("src/cli/**")}`,
              `!${toPath("src/index.js")}`,
            ],
            message: "Don't use code from other directory.",
          },
        ],
      ],
    },
  },
  {
    files: ["src/language-js/needs-parens.js"],
    rules: {
      "prettier-internal-rules/better-parent-property-check-in-needs-parens":
        "error",
    },
  },
  {
    files: ["src/**/*.js"],
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
    ignores: ["src/language-js/parse/postprocess/*.js"],
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
  ...compat
    .env({ browser: true, worker: true })
    .map((config) => ({ ...config, files: ["website/**/*"] })),
  // Use `Object.assign` since it contains non-enumerable properties
  Object.assign(eslintPluginReactConfigRecommended, {
    files: ["website/**/*"],
    settings: {
      react: {
        version: "18",
      },
    },
  }),
  {
    files: ["website/**/*"],
    rules: {
      "react/display-name": "off",
      "react/no-deprecated": "off",
      "react/prop-types": "off",
      "unicorn/filename-case": "off",
    },
  },
  {
    files: ["website/playground/**/*"],
    languageOptions: {
      sourceType: "module",
    },
  },
  // `import/no-extraneous-dependencies` reports on Windows but not on CI
  {
    files: ["website/siteConfig.js"],
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
  },
  {
    files: ["bin/prettier.cjs"],
    languageOptions: {
      ecmaVersion: 5,
    },
    rules: {
      "no-var": "off",
      "prefer-arrow-callback": "off",
    },
  },
];
