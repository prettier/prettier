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

      "x?.y++",
      "x?.y.z++",
      "x?.y().z++",
    ],
  },
  ["typescript", "babel-ts", "oxc-ts", "yuku-ts"],
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["a()++", "(a())++"],
  },
  ["typescript", "oxc-ts", "yuku-ts"],
);
