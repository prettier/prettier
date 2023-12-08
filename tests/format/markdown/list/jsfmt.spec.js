const emptyListItemSnippets = [
  { name: "empty list items (issue 4122)", code: "1.\n2.\n3.\n4." },
  {
    name: "empty list items with spaces (issue 4122)",
    code: "1. \n2. \n3. \n4. ",
  },
];

run_spec(
  { importMeta: import.meta, snippets: emptyListItemSnippets },
  ["markdown"],
  { proseWrap: "always" },
);
run_spec(import.meta, ["markdown"], { proseWrap: "always", tabWidth: 4 });
run_spec(import.meta, ["markdown"], { proseWrap: "always", tabWidth: 999 });
run_spec(import.meta, ["markdown"], { proseWrap: "always", tabWidth: 0 });
