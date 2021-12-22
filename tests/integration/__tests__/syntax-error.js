"use strict";

const runPrettier = require("../runPrettier.js");

describe("exits with non-zero code when input has a syntax error", () => {
  runPrettier("cli/with-shebang", ["--parser", "babel"], {
    input: "a.2",
  }).test({
    status: 2,
  });
});
