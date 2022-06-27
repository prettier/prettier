"use strict";

const runPrettier = require("../run-prettier.js");

describe("print path when ignore file found", () => {
  runPrettier("cli/config/ignore", ["--find-ignore-path", "file.js"]).test({
    includes: ["./cli/config/ignore.prettierignore"],
  });
});

describe("Test with multiple files", () => {
  runPrettier("cli/config/no-ignore", [
    "--find-ignore-path",
    "file.js",
    "file2.js",
  ]).test({
    status: 1,
  });
});
