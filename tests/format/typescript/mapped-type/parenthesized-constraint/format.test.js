runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "issue-16759",
        code: "type BooleanValues = { [key in (keyof MyObject)]: boolean };",
        output:
          "type BooleanValues = { [key in (keyof MyObject)]: boolean };\n",
      },
    ],
  },
  ["typescript"],
);

runFormatTest(import.meta, ["typescript"], { printWidth: 40 });
