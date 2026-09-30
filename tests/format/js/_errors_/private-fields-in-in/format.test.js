import { outdent } from "outdent";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // https://github.com/tc39/proposal-private-fields-in-in#try-statement
      outdent`
        class C {
          #brand;

          static isC(obj) {
            return try obj.#brand;
          }
        }
      `,
    ],
  },
  ["babel"],
);
