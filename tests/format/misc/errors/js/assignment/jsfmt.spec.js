run_spec(
  {
    importMeta: import.meta,
    snippets: ["({}) = x;", "let?.[a] = 1"],
  },
  ["babel", "babel-ts", "acorn", "espree", "meriyah"],
);

run_spec(
  {
    importMeta: import.meta,
    snippets: ["let?.()[a] =1"],
  },
  ["babel", "babel-ts", "acorn", "espree"],
);

run_spec(
  {
    importMeta: import.meta,
    snippets: ["class Foo extends ((let)[0] = 1) {}"],
  },
  ["acorn", "espree", "meriyah"],
);

run_spec(
  {
    importMeta: import.meta,
    snippets: ["export default ((let)[0] = 1);"],
  },
  ["espree", "meriyah"],
);
