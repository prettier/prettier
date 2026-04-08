import { testCases } from "../../../misc/shared-fixtures/class-property-named-constructor.js";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: testCases.map((code) => `abstract ${code}`),
  },
  ["typescript", "babel-ts", "oxc-ts"],
);
