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
  ["babel", "meriyah", "flow", "typescript", "babel-flow", "babel-ts"],
);
