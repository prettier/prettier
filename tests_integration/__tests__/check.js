"use strict";

const runPrettier = require("../runPrettier");

describe("checks stdin with --check", () => {
  runPrettier("cli/with-shebang", ["--check", "--parser", "babylon"], {
    input: "0"
  }).test({
    stdout: "(stdin)\n",
    stderr:
      "[warn] --parser=babylon is deprecated; we now treat it as --parser=babel.\n",
    status: "non-zero"
  });
});

describe("checks stdin with -c (alias for --check)", () => {
  runPrettier("cli/with-shebang", ["-c", "--parser", "babylon"], {
    input: "0"
  }).test({
    stdout: "(stdin)\n",
    stderr:
      "[warn] --parser=babylon is deprecated; we now treat it as --parser=babel.\n",
    status: "non-zero"
  });
});
