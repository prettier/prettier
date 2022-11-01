run_spec(
  {
    importMeta: import.meta,
    snippets: [
      {
        code: 'import "foo"',
        filename: "script.cjs",
      },
      {
        code: "with(foo) {}",
        filename: "module.mjs",
      },
      {
        code: "delete foo",
        filename: "module.mjs",
      },
    ],
  },
  ["acorn", "espree", "meriyah"]
);
