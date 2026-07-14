runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      "let x!",
      "let x! = 1",
      "class C {x!}",
      "class C {x! = 1}",
      // "class C {accessor x!}",
      // "class C {accessor x! = 1}",
    ],
  },
  ["typescript", "babel-ts", "oxc-ts"],
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["class C {accessor x!}", "class C {accessor x! = 1}"],
  },
  [
    "typescript",
    "babel-ts",
    // https://github.com/oxc-project/oxc/issues/24503
    // "oxc-ts",
  ],
);
