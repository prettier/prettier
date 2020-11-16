run_spec(
  {
    dirname: __dirname,
    snippets: ["for each (a in b) {}"],
  },
  ["babel", "flow", "typescript", "babel-flow", "babel-ts", "espree"]
);
