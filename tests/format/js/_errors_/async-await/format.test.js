import { outdent } from "outdent";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      outdent`
        async function foo() {
          function bar(x = await 2) {}
        }
      `,
      "async (x = await 2) => {};",
      "async (x = await (2)) => {};",
      "f = async (a) => await a! ** 6;",
      "f = (a) => +a! ** 6;",
      {
        code: "async (a) => (await a!) ** 6;",
        filename: "non-null-expression.js",
      },
      "(-+5 ** 6);",
      "f = async () => await 5 ** 6;",
      "f = async () => await -5 ** 6;",
      "async({ foo33 = 1 });",
    ],
  },
  ["babel", "acorn", "espree", "meriyah", "flow"],
);
