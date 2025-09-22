runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["for (var of X);", "for (var of of);", "for (var in X);"],
  },
  ["babel-ts", "typescript", "oxc-ts"],
);
