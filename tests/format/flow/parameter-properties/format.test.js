const fixtures = {
  importMeta: import.meta,
  snippets: [
    {
      code: "class C { constructor(public x: string) {} }",
      filename: "parameter-property.ts",
    },
  ],
};

runFormatTest(fixtures, ["flow"]);
