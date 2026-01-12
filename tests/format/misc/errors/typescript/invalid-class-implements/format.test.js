runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      "class Foo implements A?.B {}",
      'class Foo implements "thing" {}',
    ].flatMap((code) => [code, `(${code})`]),
  },
  ["typescript", "babel-ts", "oxc-ts"],
);
