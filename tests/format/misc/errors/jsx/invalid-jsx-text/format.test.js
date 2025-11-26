runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      "let x1 = <div>}</div>;",
      "let x2 = <div>></div>;",
      "let x2 = <div><</div>;",
      'let x3 = <div>{"foo"}}</div>;',
      'let x4 = <div>{"foo"}></div>;',
      'let x4 = <div>{"foo"}<</div>;',
      'let x5 = <div>}{"foo"}</div>;',
      'let x6 = <div>>{"foo"}</div>;',
      'let x6 = <div><{"foo"}</div>;',
    ],
  },
  [
    "babel",
    "babel-ts",
    "acorn",
    "espree",
    "flow",
    // "meriyah",
    "typescript",
    // "hermes",
    "oxc",
    "oxc-ts",
  ],
);
