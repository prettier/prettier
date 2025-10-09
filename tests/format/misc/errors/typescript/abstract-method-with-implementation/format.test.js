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
  ["babel-ts", "typescript", "oxc-ts"],
);
