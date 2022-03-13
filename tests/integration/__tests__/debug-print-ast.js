"use strict";

const runPrettier = require("../run-prettier.js");

describe("prints information for debugging AST --debug-print-ast", () => {
  runPrettier("cli/with-shebang", ["--debug-print-ast", "--parser", "babel"], {
    input: "const foo = 'foo';",
  }).test({
    stderr: "",
    status: 0,
  });
});
