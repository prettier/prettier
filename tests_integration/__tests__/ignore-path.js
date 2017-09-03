"use strict";

const runPrettier = require("../runPrettier");

test("ignore path", () => {
  const result = runPrettier("cli/ignore-path", [
    "**/*.js",
    "--ignore-path",
    ".gitignore",
    "-l"
  ]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(1);
});

test("support .prettierignore", () => {
  const result = runPrettier("cli/ignore-path", ["**/*.js", "-l"]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(1);
});
