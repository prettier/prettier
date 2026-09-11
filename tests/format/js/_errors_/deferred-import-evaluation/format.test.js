runFormatTest(
  {
    importMeta: import.meta,
    snippets: ['import defer { x } from "x";', 'import defer x from "x";'],
  },
  [
    "babel",
    "acorn",
    "espree",
    "meriyah",
    "typescript",
    "babel-ts",
    "oxc",
    "oxc-ts",
    "yuku",
    "yuku-ts",
    "flow",
    "hermes",
  ],
);
