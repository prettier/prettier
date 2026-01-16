import { outdent } from "outdent";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      outdent`
        abstract class Foo  {
          abstract method() { }
        }
      `,
    ],
  },
  ["typescript", "babel-ts", "oxc-ts"],
);
