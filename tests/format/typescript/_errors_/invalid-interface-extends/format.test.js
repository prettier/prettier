runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // https://github.com/typescript-eslint/typescript-eslint/pull/11271
      // https://github.com/prettier/prettier/issues/17376
      // ParenthesizedExpression
      "interface A extends (typeof fs) { }",
      // ElementAccessExpression
      "interface B extends C['D'] { }",
      // OptionalChain
      "interface E extends F?.G { }",
      // multiple extends
      "interface H extends I extends J { }",
      // NumericLiteral
      "interface K extends 2 { }",
      // nested CallExpression
      "interface L extends M().N { }",
    ],
  },
  ["typescript", "babel-ts"],
);
