run_spec(
  {
    importMeta: import.meta,
    snippets: [
      'namespace "a" {}'
    ],
  },
  ["babel-ts", "typescript"]
);
