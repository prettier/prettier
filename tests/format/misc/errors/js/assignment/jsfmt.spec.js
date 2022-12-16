run_spec(
  {
    dirname: __dirname,
    snippets: ["({}) = x;", "let?.[a] = 1"],
  },
  ["babel", "babel-ts", "acorn", "espree", "meriyah"]
);

run_spec(
  {
    dirname: __dirname,
    snippets: ["let?.()[a] =1"],
  },
  ["babel", "babel-ts", "acorn", "espree"]
);
