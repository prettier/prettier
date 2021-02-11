run_spec(
  {
    dirname: __dirname,
    snippets: ["for each (a in b) {}", "class switch() {}"],
  },
  ["babel", "flow", "typescript", "babel-flow", "babel-ts", "espree", "meriyah"]
);
