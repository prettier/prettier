import { outdent } from "outdent";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["1", "1n", "[1]", "[1n]", "[foo]"].map(
      (key) => outdent`
        enum Foo {
          ${key} = 1
        }
      `,
    ),
  },
  ["typescript", "babel-ts", "oxc-ts"],
);

// `oxc-ts` not rejecting
// https://github.com/microsoft/TypeScript/issues/61834
// https://github.com/microsoft/TypeScript/issues/42468
runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["[foo]"].map(
      (key) => outdent`
        enum Foo {
          ${key} = 1
        }
      `,
    ),
  },
  ["typescript", "babel-ts"],
);
