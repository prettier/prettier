runFormatTest(
  {
    snippets: [
      // Unknown filename
      "<!DoCtYpE html>",
    ],
    importMeta: import.meta,
  },
  ["html"],
);
