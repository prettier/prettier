run_spec(
  {
    dirname: __dirname,
    snippets: [
      "(yield y)",
      "(yield)",
      "(await y)",
      "(a?.b)",
      "a?.b",
      "(a.b())",
      "a.b()",
      "(a.b?.())",
      "a.b?.()",
    ].map((code) => `async function * a() { a |> foo(#) |> ${code}}`),
  },
  ["babel"]
);
