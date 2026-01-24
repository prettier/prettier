runFormatTest(
  {
    snippets: [
      // Unknown filename
      "const foo: string;",
    ],
    importMeta: import.meta,
  },
  ["flow"],
  { errors: { hermes: true } },
);
