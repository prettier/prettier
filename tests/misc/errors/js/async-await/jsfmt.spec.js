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
      "function foo(promise) { await promise; }",
      outdent`
        function a() {
          return await 1
        }
      `,
      "() => { await x };",
      "C = class { static { function f() { await } } };",
      "C = class { static { function f(await) {} } };",
      "C = class { static { function f(x = await) {} } };",
      "C = class { static { function f({ [await]: x }) {} } };",
      "f = async (a) => await a! ** 6;",
      "f = (a) => +a! ** 6;",
      "async (a) => (await a!) ** 6;",
      "(-+5 ** 6);",
      // TODO: Test these two edge case
      // outdent`
      //   export class C {
      //     p = await (0);
      //   }
      // `,
      // "await (0);"
    ],
  },
  ["babel", "espree", "meriyah", "flow"]
);

run_spec(
  {
    dirname: __dirname,
    snippets: [
      outdent`
        async function foo() {
          function bar(x = await (2)) {}
        }
      `,
      outdent`
        function foo() {
          await
          foo;
        }
      `,
      "function foo(promise) { await (promise); }",
      outdent`
        function a() {
          return await (1)
        }
      `,
      "() => { await (x) };",
      outdent`
        function foo() {
          await
          (foo);
        }
      `,
      // `espree` and `meriyah` didn't throw
      "f = async () => await 5 ** 6;",
      // `espree` didn't throw
      "f = async () => await -5 ** 6;",
    ],
  },
  ["babel"]
);

run_spec(
  {
    dirname: __dirname,
    snippets: ["async (x = await (2)) => {};"],
  },
  ["babel", "espree", "meriyah"]
);

run_spec(
  {
    dirname: __dirname,
    snippets: [
      outdent`
        export class C {
          p = await 0;
        }
      `,
      "await 0;",
    ],
  },
  ["espree", "meriyah"]
);
