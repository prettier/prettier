"use strict";

const runPrettier = require("../run-prettier.js");

describe("Test with multiple files", () => {
  runPrettier("cli/config/no-ignore", [
    "--find-ignore-path",
    "file.js",
    "file2.js",
  ]).test({
    status: 1,
  });
});
