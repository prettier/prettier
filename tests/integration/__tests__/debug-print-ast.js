"use strict";

const runPrettier = require("../runPrettier.js");

describe("prints information for debugging AST --debug-print-comments", () => {
  runPrettier("cli/with-shebang", ["--debug-print-ast", "--parser", "babel"], {
    input: "const foo = 'foo';",
  }).test({
    stderr: "",
    status: 0,
  });
});
