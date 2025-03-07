runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      "for each (a in b) {}",
      "class switch() {}",
      "({ method() })",
      "({ method({}) })",
      "({ method(parameter,) })",
    ],
  },
  [
    "babel",
    "flow",
    "typescript",
    "babel-flow",
    "babel-ts",
    "acorn",
    "espree",
    "meriyah",
  ],
);

runFormatTest(
  {
    importMeta: import.meta,
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
  ],
);
