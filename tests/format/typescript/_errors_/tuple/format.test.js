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

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // A required element cannot follow an optional element.
      "type T = [x?: A, y: B];",
      // Type parameters cannot appear on a constructor declaration.
      "class A { constructor<a>() {} }",
    ],
  },
  [
    // "typescript",
    "babel-ts",
    "oxc-ts",
  ],
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // Type parameters cannot appear on a constructor declaration.
      "class A { 'constructor'<a>() {} }",
    ],
  },
  [
    // "typescript",
    "babel-ts",
    // "oxc-ts",
  ],
);
