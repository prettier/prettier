run_spec(
  {
    importMeta: import.meta,
    snippets: [
      {
        code: 'import foo from "foo"',
        filename: "foo.cjs",
      },
      {
        code: "with(foo) {}",
        filename: "foo.mjs",
      },
      {
        code: "delete foo",
        filename: "foo.mjs",
      },
    ],
  },
  ["acorn", "espree", "meriyah"]
);
