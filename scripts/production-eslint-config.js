import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import eslintPluginCompat from "eslint-plugin-compat";
import packageBuildConfigs from "./build/packages/index.js";
import { PROJECT_ROOT } from "./utilities/index.js";

const { browserslist: targets } = JSON.parse(
  await fs.readFile(new URL("../package.json", import.meta.url)),
);

const jsFiles = packageBuildConfigs
  .flatMap((packageConfig) =>
    packageConfig.modules.flatMap((module) =>
      module.files
        .filter((file) => /\.[cm]?js$/u.test(file.output))
        .map((file) => path.join(packageConfig.distDirectory, file.output)),
    ),
  )
  .map((file) => path.relative(PROJECT_ROOT, file).replaceAll("\\", "/"));

const nodejsFiles = jsFiles.filter(
  (file) =>
    file.endsWith(".cjs") ||
    [
      "dist/prettier/index.mjs",
      "dist/prettier/internal/legacy-cli.mjs",
      "dist/prettier/internal/experimental-cli.mjs",
      "dist/prettier/internal/experimental-cli-worker.mjs",
      "dist/plugin-oxc/index.mjs",
    ].includes(file),
);

const browserFiles = jsFiles.filter((file) => !nodejsFiles.includes(file));

assert.ok(browserFiles.length > 0);
assert.ok(nodejsFiles.length > 0);

const restrictedSyntaxes = [
  {
    selector: String.raw`CallExpression[callee.name="require"][arguments.0.value=/^\..*?\.mjs$/]`,
    message: ".mjs file can't be `require()`d",
  },
  {
    selector:
      'TaggedTemplateExpression > MemberExpression.tag[object.name="String"][property.name="raw"]',
    message: "`String.raw` should be transformed.",
  },
  ...[
    // "at", // `.at` in `acorn` didn't transform
    "findLastIndex",
    "findLast",
    "replaceAll",
    "toReversed",
  ].map((method) => ({
    selector: `CallExpression > MemberExpression.callee[computed!=true][property.name="${method}"]`,
    message: `\`.${method}()\` should be transformed`,
  })),
];

const browserRestrictedSyntaxes = [
  {
    selector: 'CallExpression[callee.name="require"]',
    message: "Universal bundles should not include any `require()` call.",
  },
  {
    selector: "ImportDeclaration",
    message: "Universal bundles should not include any `import` declaration.",
  },
  {
    selector:
      ":matches(ExportAllDeclaration, ExportDefaultDeclaration, ExportNamedDeclaration)[source]",
    message: "Universal bundles should not `export` from other files.",
  },
  {
    selector: "ImportExpression",
    message: "Universal bundles should not include any `import()`.",
  },
];

const nodejsRestrictedSyntaxes = [
  // Forbid top level `require()` parsers
  {
    selector:
      'CallExpression:not(:function *)[callee.name="require"][arguments.0.value=/plugins/]',
    message: "Parsers should be inline `require()`d.",
  },
  // Forbid top level `import()` parsers
  {
    selector: "ImportExpression:not(:function *)[source.value=/plugins/]",
    message: "Parsers should be inline `import()`ed.",
  },
  // Forbid `import`/`export` parsers
  {
    selector:
      ":matches(ImportDeclaration, ExportAllDeclaration, ExportDefaultDeclaration, ExportNamedDeclaration)[source.value=/plugins/]",
    message: "Parsers should be inline `import()`ed.",
  },
];

export default [
  {
    name: "All files",
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
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: "off",
    },
    rules: {
      "compat/compat": "error",
      "no-restricted-syntax": ["error", ...restrictedSyntaxes],
    },
  },

  {
    name: "Browser files",
    files: browserFiles,
    rules: {
      "no-restricted-syntax": [
        "error",
        ...restrictedSyntaxes,
        ...browserRestrictedSyntaxes,
      ],
    },
  },

  {
    name: "Node.js files",
    files: nodejsFiles,
    rules: {
      "no-restricted-syntax": [
        "error",
        ...restrictedSyntaxes,
        ...nodejsRestrictedSyntaxes,
      ],
    },
  },

  {
    name: "Prettier bin file",
    files: ["bin/prettier.cjs"],
    languageOptions: {
      ecmaVersion: 5,
    },
    rules: {
      "compat/compat": "error",
    },
  },
];
