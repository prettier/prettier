runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      '/* comment */{"foo": 1}',
      '// comment\n{"foo": 1}',
      '{"foo": /* comment */ 1}',
    ],
  },
  ["json-stringify"],
);
