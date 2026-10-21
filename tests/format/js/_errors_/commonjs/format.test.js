runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      { code: "export {}", filename: "export.cjs" },
      { code: "import 'foo'", filename: "import.cjs" },
      // { code: "await 1", filename: "top-level-await.cjs" },
    ],
  },
  [
    // "babel",
    // "babel-ts",
    "acorn",
    "espree",
    // "flow",
    "meriyah",
    // "typescript",
    // "hermes",
    "oxc",
    // "oxc-ts",
    "yuku",
    "yuku-ts",
    // "__babel_estree",
  ],
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [{ code: "await 1", filename: "top-level-await.cjs" }],
  },
  [
    "babel",
    "babel-ts",
    "acorn",
    "espree",
    "flow",
    "meriyah",
    // "typescript",
    "hermes",
    "oxc",
    "oxc-ts",
    "yuku",
    "yuku-ts",
    "__babel_estree",
  ],
);
