runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // Not allowed
      "declare export interface A {}",

      // Can't have mixins nor implements
      "interface A mixins B {}",
      "interface A implements B {}",
      "declare interface A mixins B {}",
      "declare interface A implements B {}",
    ],
  },
  ["flow", "babel-flow"],
);
