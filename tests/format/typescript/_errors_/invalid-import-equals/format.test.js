runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["import type F = T;"],
  },
  [
    "typescript",
    "babel-ts",
    // Didn't reject
    // "oxc-ts"
  ],
);
