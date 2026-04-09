runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["const a = not_a_record {}"],
  },
  ["flow", "hermes"],
);
