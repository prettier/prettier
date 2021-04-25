const { outdent } = require("outdent");

run_spec(
  {
    dirname: __dirname,
    snippets: [
      "const baz3 = new obj?.foo?.bar?.baz(); // baz instance",
      "const safe5 = new obj?.qux?.baz(); // undefined",
      "const safe6 = new obj?.foo.bar.qux?.(); // undefined",
      "const willThrow = new obj?.foo.bar.qux(); // Error: not a constructor",
      outdent`
        // Top classes can be called directly, too.
        class Test {
        }
        new Test?.(); // test instance
      `,
      "new exists?.(); // undefined",
    ],
  },
  ["babel", "espree", "meriyah"]
);
