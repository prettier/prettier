runFormatTest(
  {
    importMeta: import.meta,
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
      "yield",
    ].map((code) => `async function * a() { a |> foo(%) |> ${code}}`),
  },
  ["babel"],
);
