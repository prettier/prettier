"use strict";

const runPrettier = require("../runPrettier");

describe("ignore path", () => {
  runPrettier("cli/ignore-path", [
    "**/*.js",
    "--ignore-path",
    ".gitignore",
    "-l"
  ]).test({
    status: 1
  });
});

describe("support .prettierignore", () => {
  runPrettier("cli/ignore-path", ["**/*.js", "-l"]).test({
    status: 1
  });
});
