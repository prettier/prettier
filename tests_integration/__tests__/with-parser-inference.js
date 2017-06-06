"use strict";

const runPrettier = require("../runPrettier");

test("infers postcss parser", () => {
  const result = runPrettier("cli/with-parser-inference", ["*"]);

  expect(result.stdout).toMatchSnapshot();
});

test("infers postcss parser with --list-different", () => {
  const result = runPrettier("cli/with-parser-inference", [
    "--list-different",
    "*"
  ]);

  expect(result.stdout).toMatchSnapshot();
});
