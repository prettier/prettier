"use strict";

const runPrettier = require("../runPrettier");

test("write cursorOffset to stderr with --cursor-offset <int>", () => {
  const result = runPrettier("cli", ["--cursor-offset", "2"], { input: " 1" });

  expect(result.stdout).toMatchSnapshot();
  expect(result.stderr).toMatchSnapshot();
  expect(result.status).toEqual(0);
});
