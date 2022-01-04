run_spec(
  {
    importMeta: import.meta,
    snippets: ["({}) = x;"],
  },
  ["babel", "babel-ts", "espree", "meriyah"]
);
