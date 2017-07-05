"use strict";

const runPrettier = require("../runPrettier");

test("prints doc with --debug-print-doc", () => {
  const result = runPrettier("cli/with-shebang", ["--debug-print-doc"], {
    input: "0"
  });

  expect(result.stdout).toEqual('["0", ";", hardline, breakParent];\n');
  expect(result.stderr).toEqual("");
  expect(result.status).toEqual(0);
});
