const emptyListItemSnippets = [
  { name: "empty list items (issue 4122)", code: "1.\n2.\n3.\n4." },
  {
    name: "empty list items with spaces (issue 4122)",
    code: "1. \n2. \n3. \n4. ",
  },
];

runFormatTest(
  { importMeta: import.meta, snippets: emptyListItemSnippets },
  ["markdown"],
  { proseWrap: "always" },
);
