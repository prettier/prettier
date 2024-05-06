runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      "1 ++",

      "(1)++",
      "(1)--",

      "++(1)",
      "--(1)",

      "(1 + 2)++",
      "(1 + 2)--",

      "++(1 + 2)",
      "--(1 + 2)",

      "(x + x)++",
      "(x + x)--",

      "++(x + x)",
      "--(x + x)",

      "a()++",
      "x?.y++",
      "x?.y.z++",
      "x?.y().z++",
      "(a())++",
    ],
  },
  ["babel-ts", "typescript"],
);
