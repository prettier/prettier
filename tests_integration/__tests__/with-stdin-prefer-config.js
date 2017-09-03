"use strict";

const runPrettier = require("../runPrettier");

test("CLI overrides does not take precedence with --stdin-prefer-config true", () => {
  const output = runPrettier("cli/config/js/", [
    "--tab-width",
    "1",
    "--stdin-prefer-config",
    "true",
    "**/*.js"
  ]);
  expect(output.stdout).toMatchSnapshot();
  expect(output.status).toEqual(0);
});
