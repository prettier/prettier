runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["declare function foo() {}"],
  },
  ["typescript", "babel-ts", "oxc-ts"],
);
