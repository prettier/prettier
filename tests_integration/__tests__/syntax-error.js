"use strict";

const runPrettier = require("../runPrettier");

describe("exits with non-zero code when input has a syntax error", () => {
  runPrettier("cli/with-shebang", ["--stdin", "--no-color"], {
    input: "a.2"
  }).test({
    status: 2
  });
});
