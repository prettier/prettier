runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // https://github.com/babel/babel/commit/a466f9c310ace91484d4087f077ee6d6c8cd8789
      "export type Foo = number;",
    ],
  },
  ["babel"],
);
