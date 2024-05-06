runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["class interface {}", 'import interface from "foo";'],
  },
  ["espree", "meriyah"],
);
