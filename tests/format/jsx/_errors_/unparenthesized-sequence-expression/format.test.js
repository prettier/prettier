runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["let x1 = <div>{a,b}</div>"],
  },
  [
    "babel",
    "babel-ts",
    // "acorn",
    // "espree",
    // "flow",
    "meriyah",
    // "typescript",
    "hermes",
    // "oxc",
    // "oxc-ts",
  ],
);
