runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["class interface {}", 'import interface from "foo";'],
  },
  [
    // "babel",
    // "babel-ts",
    "acorn",
    "espree",
    "flow",
    "meriyah",
    // "typescript",
    // "hermes",
    // "oxc",
    // "oxc-ts",
  ],
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [String.raw`export asyn\u{63} from "async";`],
  },
  [
    // "babel",
    // "babel-ts",
    "acorn",
    "espree",
    "flow",
    "meriyah",
    "typescript",
    "hermes",
    "oxc",
    "oxc-ts",
  ],
);
