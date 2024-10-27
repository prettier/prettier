run_spec(
  {
    dirname: __dirname,
    snippets: [
      "import();",
      "import(/* comment */);",
      "new import('./a.mjs');",
      "new import();",
    ],
  },
  ["babel", "espree", "meriyah", "flow", "typescript", "babel-flow", "babel-ts"]
);
