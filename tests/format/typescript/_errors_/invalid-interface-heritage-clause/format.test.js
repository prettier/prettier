runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      "interface Foo extends {}",
      "interface F implements {}",
      "interface F implements A {}",
      // "interface F extends implements {}",
    ],
  },
  ["typescript", "babel-ts", "oxc-ts", "yuku-ts"],
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["interface F extends implements {}"],
  },
  [
    "typescript",
    // "babel-ts",
    // "oxc-ts",
    // "yuku-ts",
  ],
);
