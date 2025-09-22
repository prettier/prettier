runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["declare function foo() {}"],
  },
  ["babel-ts", "typescript", "oxc-ts"],
);
