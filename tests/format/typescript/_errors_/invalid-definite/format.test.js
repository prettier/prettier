runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      "let x!",
      "let x! = 1",
      "class C {x!}",
      "class C {x! = 1}",
      "class C {accessor x!}",
      "class C {accessor x! = 1}",
    ],
  },
  ["typescript", "babel-ts", "oxc-ts", "yuku-ts"],
);
