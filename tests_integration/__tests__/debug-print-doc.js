"use strict";

const runPrettier = require("../runPrettier");

describe("prints doc with --debug-print-doc", () => {
  runPrettier(
    "cli/with-shebang",
    ["--parser", "babylon", "--debug-print-doc"],
    { input: "0" }
  ).test({
    stdout: '["0", ";", hardline, breakParent]',
    stderr: "",
    status: 0
  });
});
