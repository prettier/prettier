const { outdent } = require("outdent");

run_spec(
  {
    dirname: __dirname,
    snippets: [
      outdent`
        async function foo() {
          function bar(x = await 2) {}
        }
      `,
      "async (x = await 2) => {};",
      "f = async (a) => await a! ** 6;",
      "f = (a) => +a! ** 6;",
      "async (a) => (await a!) ** 6;",
      "(-+5 ** 6);",
      "f = async () => await 5 ** 6;",
      "f = async () => await -5 ** 6;",
      "async({ foo33 = 1 });",
    ],
  },
  ["babel", "espree", "meriyah", "flow"]
);

run_spec(
  {
    dirname: __dirname,
    snippets: [
      // `flow` and `meriyah` didn't throw
      "async (x = await (2)) => {};",
    ],
  },
  ["babel", "espree"]
);
