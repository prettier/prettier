runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      "for (let a = 1 in b);",
      "for (const a = 1 in b);",
      "{for (using a = 1 in b);}",
    ],
  },
  [
    // "babel",
    "acorn",
    "espree",
    "meriyah",
    "typescript",
    // "babel-ts",
    "oxc",
    "oxc-ts",
    "yuku",
    "yuku-ts",
    "flow",
    "hermes",
    // "__babel_estree",
  ],
);
