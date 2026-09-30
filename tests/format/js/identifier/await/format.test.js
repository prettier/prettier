const testCases = [
  "await(1)",
  "(await)(1)",

  "await(1,2)",
  "(await)(1,2)",

  "await()",
  "(await)()",

  "await?.(1)",
  "(await)?.()",

  "await + 1",
  "(await) + 1",

  "await - 1",
  "(await) - 1",

  "await[0]",
  "(await)[0]",

  "await.all [0]",
  "(await).all [0]",

  "await?.x",
  "(await)?.x",
].map((code) => ({ code, filepath: "test.cjs" }));

runFormatTest(
  {
    importMeta: import.meta,
    snippets: testCases,
  },
  ["babel", "flow", "typescript"],
  { semi: false },
);
