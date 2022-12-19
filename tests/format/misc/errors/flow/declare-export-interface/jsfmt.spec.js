run_spec(
  {
    importMeta: import.meta,
    snippets: ["declare export interface A {}"],
  },
  ["flow", "babel-flow"]
);
