runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["({}) = x;"],
  },
  ["babel", "babel-ts", "acorn", "espree", "meriyah"],
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["class Foo extends ((let)[0] = 1) {}"],
  },
  ["acorn", "espree", "meriyah"],
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["export default ((let)[0] = 1);"],
  },
  ["espree", "meriyah"],
);
