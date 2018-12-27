"use strict";

const runPrettier = require("../runPrettier");

describe("checks stdin with --list-different", () => {
  runPrettier("cli/with-shebang", ["--list-different", "--parser", "babel"], {
    input: "0"
  }).test({
    stdout: "(stdin)\n",
    stderr: "",
    status: "non-zero"
  });
});

describe("checks stdin with -l (alias for --list-different)", () => {
  runPrettier("cli/with-shebang", ["-l", "--parser", "babel"], {
    input: "0"
  }).test({
    stdout: "(stdin)\n",
    stderr: "",
    status: "non-zero"
  });
});
