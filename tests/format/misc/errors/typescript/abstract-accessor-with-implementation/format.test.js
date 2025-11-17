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
  ["typescript", "babel-ts", "oxc-ts"],
);
