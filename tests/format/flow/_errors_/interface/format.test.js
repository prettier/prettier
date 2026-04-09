runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // Can't have mixins nor implements
      "interface A mixins B {}",
      "interface A implements B {}",
      "declare interface A mixins B {}",
      "declare interface A implements B {}",
    ],
  },
  ["flow", "babel-flow"],
);
