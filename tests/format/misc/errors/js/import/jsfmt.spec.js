run_spec(
  {
    importMeta: import.meta,
    snippets: [
      "import();",
      "import(/* comment */);",
      "new import('./a.mjs');",
      "new import();",
    ],
  },
  [
    "babel",
    "acorn",
    "espree",
    "meriyah",
    "flow",
    "typescript",
    "babel-flow",
    "babel-ts",
  ]
);
