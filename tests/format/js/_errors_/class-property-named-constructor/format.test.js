import { testCases } from "../../../misc/shared-fixtures/class-property-named-constructor.js";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: testCases,
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
    "flow",
    "hermes",
  ],
);
