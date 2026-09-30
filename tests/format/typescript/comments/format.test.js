runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        code: "let foo9: new /* foo */ (/* bar */) /* baz */ => string;",
        output: "let foo9: new /* foo */ (/* bar */) /* baz */ => string;\n",
      },
      {
        code: "interface Foo { new /* foo */ (/* bar */) /* baz */: string; }",
        output:
          "interface Foo {\n  new /* foo */ (/* bar */) /* baz */ : string;\n}\n",
      },
    ],
  },
  ["typescript"],
);
