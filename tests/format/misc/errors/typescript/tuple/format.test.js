runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // Invalid label 1
      "type T = [x.y: A];",
      // Invalid label 2
      "type T = [x<y>: A];",
    ],
  },
  ["typescript", "babel-ts", "oxc-ts"],
);
