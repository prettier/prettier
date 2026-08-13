runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      "import();",
      "import(/* comment */);",
      "new import('./a.mjs');",
      "new import();",
    ],
  },
  [
    "babel",
    // "acorn",
    // "espree",
    "meriyah",
    "typescript",
    "babel-ts",
    "oxc",
    "oxc-ts",
    "yuku",
    "yuku-ts",
    "flow",
    // "hermes",
  ],
);
