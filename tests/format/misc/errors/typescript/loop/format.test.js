runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["for (var of X);", "for (var of of);", "for (var in X);"],
  },
  ["typescript", "babel-ts", "oxc-ts"],
);
