run_spec(
  {
    importMeta: import.meta,
    snippets: ["`\n   \n   \n` + `\n    \n    \n`;"],
  },
  ["babel", "flow", "typescript"],
);
