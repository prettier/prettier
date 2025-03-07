runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["```\na", "```\na\n", "```\na\n\n", "```\na" + "\n".repeat(10)],
  },
  ["markdown"],
);
