runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["@let fn = (   should, not, print,trailing, comma) =>   1;"],
  },
  ["angular"],
  { printWidth: 1, trailingComma: "all" },
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      "@let fn = (   oneArgument) =>   1;",
      "@let fn = oneArgument =>   1;",
    ],
  },
  ["angular"],
  { arrowParens: "avoid" },
);
