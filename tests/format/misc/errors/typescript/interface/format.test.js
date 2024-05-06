runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // Invalid initializer
      "interface I { x: number = 1;}",
      // Can't have mixins nor implements
      "interface A mixins B {}",
      "interface A implements B {}",
    ],
  },
  ["babel-ts", "typescript"],
);
