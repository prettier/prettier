const fixtures = {
  importMeta: import.meta,
  snippets: [
    { code: "export as namespace Library;", filename: "library.d.ts" },
  ],
};

runFormatTest(fixtures, ["flow"]);
runFormatTest(fixtures, ["flow"], { semi: false });
