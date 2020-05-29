const { outdent } = require("outdent");

run_spec(
  {
    dirname: __dirname,
    snippets: [
      // v8intrinsic
      "::%DebugPrint(null)",
      "a.%DebugPrint();",
      "const i = %DebugPrint;",

      // partialApplication
      // https://babeljs.io/docs/en/babel-plugin-proposal-partial-application#invalid-usage
      "f(x + ?)", // `?` not in top-level Arguments of call
      "x + ?", // `?` not in top-level Arguments of call
      "?.f()", // `?` not in top-level Arguments of call
      // "new f(?)", // `?` not supported in `new`
      // "super(?)", // `?` not supported in |SuperCall|

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
  ["babel"]
);
