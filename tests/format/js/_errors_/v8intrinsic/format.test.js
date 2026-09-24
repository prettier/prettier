runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // v8intrinsic
      "::%DebugPrint(null)",
      "a.%DebugPrint();",
      "const i = %DebugPrint;",
    ],
  },
  [
    "babel",
    "acorn",
    "espree",
    "meriyah",
    "typescript",
    "babel-ts",
    "oxc",
    "oxc-ts",
    "yuku",
    "yuku-ts",
    "flow",
    "hermes",
  ],
);
