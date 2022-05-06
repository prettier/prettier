run_spec(
  {
    importMeta: import.meta,
    snippets: ["({}) = x;"],
  },
  ["babel", "babel-ts", "acorn", "espree", "meriyah"]
);
