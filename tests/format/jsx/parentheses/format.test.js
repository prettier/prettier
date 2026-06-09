runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["export default <></>", "export default <div/>"],
  },
  [
    "babel",
    "babel-flow",
    "babel-ts",
    "__babel_estree",
    "typescript",
    "flow",
    "meriyah",
    "acorn",
    "espree",
    "espree",
    "hermes",
    "oxc",
    "oxc-ts",
  ],
);
