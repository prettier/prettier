runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      String.raw`import { "\uD83C" as b } from "./foo";`,
      String.raw`export { "\uD83C" } from "./foo";`,
      String.raw`export { "\uD83C" as b } from "./foo";`,
      String.raw`export { b as "\uD83C" } from "./foo";`,
    ],
  },
  [
    "babel",
    "babel-flow",
    "babel-ts",
    "__babel_estree",
    // "typescript",
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
