runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // Using a record or tuple literal on the `lhs` is a `SyntaxError`
      "const #{ a, b } = #{ a: 1, b: 2 };",
      "const #[a, b] = #[1, 2];",
      // holes
      // "const x = #[,];", // Should be error, babel didn't throw
      // __proto__
      // "const x = #{ __proto__: foo };", // Should be error, babel didn't throw

      // Don't support `syntaxType: "bar"`
      "[| 1 |]",
      // "{| a: 1 |}", // babel didn't throw on this

      // Invalid decimal
      "0b101011101m;",
      "0x16432m;",
      "0o16432m;",
    ],
  },
  ["babel"],
);
