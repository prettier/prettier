"use strict";

const runPrettier = require("../runPrettier");

test("resolves configuration from external files", () => {
  const output = runPrettier("cli/config/", ["**/*.js"]);
  expect(output.stdout).toMatchSnapshot();
  expect(output.status).toEqual(0);
});

test("CLI overrides take precedence", () => {
  const output = runPrettier("cli/config/", ["--print-width", "1", "**/*.js"]);
  expect(output.stdout).toMatchSnapshot();
  expect(output.status).toEqual(0);
});
