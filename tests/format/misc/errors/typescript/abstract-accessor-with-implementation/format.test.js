import { outdent } from "outdent";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      outdent`
        abstract class Foo  {
          abstract get getter() { }
        }
      `,
      outdent`
        abstract class Foo  {
          abstract set setter(v) { }
        }
      `,
    ],
  },
  ["babel-ts", "typescript", "oxc-ts"],
);
