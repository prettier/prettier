"use strict";

const runPrettier = require("../run-prettier.js");

describe("ignore patterns", () => {
  runPrettier("cli/ignore-patterns", [
    "**/*.js",
    "--ignore-pattern",
    "**/other-regular-module.js",
    "-l",
  ]).test({
    status: 1,
  });
});

describe("ignore patterns with multiple arguments", () => {
  runPrettier("cli/ignore-patterns", [
    "**/*.js",
    "--ignore-pattern",
    "**/other-regular-module.js",
    "--ignore-pattern",
    "**/regular-module.js",
    "-l",
  ]).test({
    status: 0,
  });
});

describe("outputs files as-is if no --write", () => {
  runPrettier(
    "cli/ignore-patterns",
    ["--ignore-pattern", "**/regular-module.js", "regular-module.js"],
    {
      ignoreLineEndings: true,
    }
  ).test({
    status: 0,
  });
});
