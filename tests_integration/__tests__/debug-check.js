"use strict";

const runPrettier = require("../runPrettier");

test("doesn't crash when --debug-check is passed", () => {
  const result = runPrettier("cli/with-shebang", [
    "issue1890.js",
    "--debug-check"
  ]);

  expect(result.stderr).toEqual("");
});
