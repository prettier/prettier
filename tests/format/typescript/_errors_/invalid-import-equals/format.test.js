runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["import type F = T;"],
  },
  ["typescript", "babel-ts", "oxc-ts", "yuku-ts"],
);
