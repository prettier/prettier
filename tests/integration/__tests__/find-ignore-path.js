"use strict";

const runPrettier = require("../run-prettier.js");

describe("print path when ignore file found", () => {
  runPrettier("cli/config/ignore", ["--find-ignore-path", "file.js"]).test({
    status: 0,
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
