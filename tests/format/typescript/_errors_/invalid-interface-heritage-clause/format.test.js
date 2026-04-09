runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      "interface Foo extends {}",
      "interface F implements {}",
      "interface F implements A {}",
    ],
  },
  ["typescript", "babel-ts", "oxc-ts"],
);
runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["interface F extends implements {}"],
  },
  ["typescript"],
);
