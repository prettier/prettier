"use strict";

const runPrettier = require("../runPrettier");

test("checks stdin with --list-different", () => {
  const result = runPrettier("cli/with-shebang", ["--list-different"], {
    input: "0"
  });

  expect(result.stdout).toEqual("(stdin)\n");
  expect(result.stderr).toEqual("");
  expect(result.status).not.toEqual(0);
});
