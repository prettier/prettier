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
    // "oxc",
    // "oxc-ts",
  ],
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // cspell:disable-next-line
      String.raw`export asyn\u{63} from "async";`,
    ],
  },
  [
    // "babel",
    // "babel-ts",
    "acorn",
    "espree",
    "flow",
    "meriyah",
    "typescript",
    "oxc",
    "oxc-ts",
    "yuku",
    "yuku-ts",
  ],
);
