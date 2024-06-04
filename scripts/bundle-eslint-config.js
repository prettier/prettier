import fs from "node:fs/promises";
import url from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginCompat from "eslint-plugin-compat";

const { browserslist: targets } = JSON.parse(
  await fs.readFile(new URL("../package.json", import.meta.url)),
);

const toPath = (file) => url.fileURLToPath(new URL(file, import.meta.url));
const compat = new FlatCompat({ baseDirectory: toPath("./") });

/* TODO[@fisker]: Fix `no-restricted-syntax` */

export default [
  {
    plugins: {
      compat: eslintPluginCompat,
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
    rules: {
      "no-restricted-syntax": [
        "error",
        // Forbid `require()` .mjs file
        {
          selector: String.raw`CallExpression[callee.name="require"][arguments.0.value=/^\..*?\.mjs$/]`,
          message: ".mjs file can't be `require()`d",
        },
      ],
    },
  },

  {
    files: [
      "doc.js",
      "doc.mjs",
      "standalone.js",
      "standalone.mjs",
      "plugins/*",
    ],
    ...compat.env({ browser: true }),
    rules: {
      "compat/compat": "error",
      // "no-restricted-syntax": [
      //   "error",
      //   // Forbid `require()`
      //   {
      //     selector: 'CallExpression[callee.name="require"]',
      //     message:
      //       "Universal bundles should not include any `require()` call.",
      //   },
      //   {
      //     selector: "ImportDeclaration",
      //     message:
      //       "Universal bundles should not include any `import` declaration.",
      //   },
      //   {
      //     selector:
      //       ":matches(ExportAllDeclaration, ExportDefaultDeclaration, ExportNamedDeclaration)[source]",
      //     message: "Universal bundles should not `export` from other files.",
      //   },
      //   {
      //     selector: "ImportExpression",
      //     message: "Universal bundles should not include any `import()`.",
      //   },
      // ],
    },
  },
  {
    files: ["index.cjs", "index.mjs", "bin/*", "internal/*"],
    rules: {
      // "no-restricted-syntax": [
      //   "error",
      //   // Forbid top level `require()` parsers
      //   {
      //     selector:
      //       'CallExpression:not(:function *)[callee.name="require"][arguments.0.value=/plugins/]',
      //     message: "Parsers should be inline `require()`d.",
      //   },
      //   // Forbid top level `import()` parsers
      //   {
      //     selector:
      //       "ImportExpression:not(:function *)[source.value=/plugins/]",
      //     message: "Parsers should be inline `import()`ed.",
      //   },
      //   // Forbid `import`/`export` parsers
      //   {
      //     selector:
      //       ":matches(ImportDeclaration, ExportAllDeclaration, ExportDefaultDeclaration, ExportNamedDeclaration)[source.value=/plugins/]",
      //     message: "Parsers should be inline `import()`ed.",
      //   },
      // ],
    },
  },
  {
    files: ["bin/prettier.cjs"],
    languageOptions: {
      ecmaVersion: 5,
    },
    rules: {
      "compat/compat": "error",
    },
  },
];
