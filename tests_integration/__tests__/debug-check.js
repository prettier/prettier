"use strict";

const runPrettier = require("../runPrettier");

test("doesn't crash when --debug-check is passed", () => {
  const result = runPrettier("cli/with-shebang", [
    "issue1890.js",
    "--debug-check"
  ]);

  expect(result.stdout).toEqual("issue1890.js\n");
  expect(result.stderr).toEqual("");
  expect(result.status).toEqual(0);
});

test("checks stdin with --debug-check", () => {
  const result = runPrettier("cli/with-shebang", ["--debug-check"], {
    input: "0"
  });

  expect(result.stdout).toEqual("(stdin)\n");
  expect(result.stderr).toEqual("");
  expect(result.status).toEqual(0);
});
