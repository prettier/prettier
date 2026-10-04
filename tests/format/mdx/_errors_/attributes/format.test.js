runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "Invalid attribute",
        code: '<Foo bar={   {key:"value"    }/>',
      },
    ],
  },
  ["mdx"],
);
