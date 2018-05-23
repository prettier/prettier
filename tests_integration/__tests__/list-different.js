"use strict";

const runPrettier = require("../runPrettier");

describe("checks stdin with --list-different", () => {
  runPrettier("cli/with-shebang", ["--list-different", "--parser", "babylon"], {
    input: "0"
  }).test({
    stdout: "(stdin)\n",
    stderr: "",
    status: "non-zero"
  });
});

describe("throws an error using --list-different without filepath or parser", () => {
  runPrettier("cli/with-shebang", ["--list-different"], {
    input: "0"
  }).test({
    stdout: "",
    status: 0
  });
});
