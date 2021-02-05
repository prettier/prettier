const emptyListItemSnippets = [
  { name: "empty list items (issue 4122)", code: "1.\n2.\n3.\n4." },
  {
    name: "empty list items with spaces (issue 4122)",
    code: "1. \n2. \n3. \n4. ",
  },
];

run_spec(
  { dirname: __dirname, snippets: emptyListItemSnippets },
  ["markdown"],
  { proseWrap: "always" }
);
run_spec(__dirname, ["markdown"], { proseWrap: "always", tabWidth: 4 });
run_spec(__dirname, ["markdown"], { proseWrap: "always", tabWidth: 999 });
run_spec(__dirname, ["markdown"], { proseWrap: "always", tabWidth: 0 });
