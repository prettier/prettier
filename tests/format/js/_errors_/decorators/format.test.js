import { outdent } from "outdent";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      outdent`
        @decorator1
        export @decorator2 class A{}
      `,
      outdent`
        @decorator1
        export default @decorator2 class A{}
      `,
      "@decorator1 export @decorator2 class A {}",
      "@decorator1 export default @decorator2 class A {}",
      "export @decorator2 default class A {}",
    ],
  },
  ["babel"],
);
