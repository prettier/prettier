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
  runPrettier("cli/with-shebang", ["-l", "--parser", "babylon"], {
    input: "0"
  }).test({
    stdout: "(stdin)\n",
    stderr:
      "[warn] --parser=babylon is deprecated; we now treat it as --parser=babel.\n",
    status: "non-zero"
  });
});
