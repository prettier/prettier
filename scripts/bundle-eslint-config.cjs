"use strict";

const targets = require("../package.json").browserslist;

module.exports = {
  root: true,
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
  overrides: [
    {
      files: ["**/*.mjs"],
      parserOptions: {
        sourceType: "module",
      },
    },
    {
      files: [
        "doc.js",
        "parser-*.js",
        "standalone.js",
        "parser-*.mjs",
        "standalone.mjs",
      ],
      env: {
        browser: true,
      },
      rules: {
        "compat/compat": "error",
      },
    },
    {
      files: ["bin-prettier.js"],
      parserOptions: {
        ecmaVersion: 5,
      },
      rules: {
        "compat/compat": "error",
      },
    },
    {
      files: ["index.js", "bin-prettier.js", "cli.js", "third-party.js"],
      rules: {
        "no-restricted-syntax": [
          "error",
          // Forbid top level `require()` parsers
          {
            selector:
              'CallExpression:not(:function *)[callee.name="require"][arguments.0.value=/parser-/]',
            message: "Parsers should be inline `require()`d.",
          },
        ],
      },
    },
    {
      files: ["doc.js", "parser-*.js", "standalone.js"],
      rules: {
        "no-restricted-syntax": [
          "error",
          // Forbid `require()`
          {
            selector: 'CallExpression[callee.name="require"]',
            message: "UMD bundles should not include any `require()` call.",
          },
        ],
      },
    },
  ],
};
