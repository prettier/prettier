run_spec(
  {
    importMeta: import.meta,
    snippets: [
      // Invalid initializer
      "interface I { x: number = 1;}",
    ],
  },
  ["babel-ts", "typescript"]
);
