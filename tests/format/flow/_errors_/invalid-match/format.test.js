runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["match () {}", "match (...b) {}"],
  },
  ["flow"],
);
