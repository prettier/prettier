runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      "class A {private protected method(){}}",
      "class A {protected public method(){}}",
      "class A {private private method(){}}",
      "class A {private protected property}",
      "class A {protected public property}",
      "class A {private private property}",
    ],
  },
  ["typescript", "babel-ts"],
);
