run_spec(
  {
    dirname: __dirname,
    snippets: ["for each (a in b) {}", "class switch() {}"],
  },
  ["babel", "flow", "typescript", "babel-flow", "babel-ts", "espree", "meriyah"]
);

run_spec(
  {
    dirname: __dirname,
    snippets: [
      "(a = b) = 1",
      "a = 1 = 2",
      "(a = 1) = 2",
      "(a += b) = 1",
      "(a = b) += 1",
    ],
  },
  [
    "babel",
    "flow",
    // "typescript",
    "babel-flow",
    "babel-ts",
    // https://github.com/eslint/espree/issues/470
    // "espree",
    "meriyah",
  ]
);
