run_spec(
  {
    dirname: __dirname,
    snippets: [
      "foo as any = 10;",
      "({ a: b as any = 2000 } = x);",
      "<string>foo = '100';",
    ],
  },
  ["babel-ts"]
);
