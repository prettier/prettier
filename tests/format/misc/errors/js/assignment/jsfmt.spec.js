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

run_spec(
  {
    dirname: __dirname,
    snippets: ["class Foo extends ((let)[0] = 1) {}"],
  },
  ["acorn", "espree", "meriyah"]
);

run_spec(
  {
    dirname: __dirname,
    snippets: ["export default ((let)[0] = 1);"],
  },
  ["espree", "meriyah"]
);
