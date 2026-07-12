runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["let x!", "let x! = 1"],
  },
  ["typescript", "babel-ts", "oxc-ts"],
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["class C {x!}", "class C {x! = 1}"],
  },
  [
    // https://github.com/typescript-eslint/typescript-eslint/issues/12532
    // "typescript",
    "babel-ts",
    "oxc-ts",
  ],
);
