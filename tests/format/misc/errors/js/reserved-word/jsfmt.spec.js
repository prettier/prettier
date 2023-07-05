run_spec(
  {
    importMeta: import.meta,
    snippets: ["class interface {}", 'import interface from "foo";'],
  },
  ["espree", "meriyah"],
);
