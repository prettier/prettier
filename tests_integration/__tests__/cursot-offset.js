"use strict";

const runPrettier = require("../runPrettier");

describe("write cursorOffset to stderr with --cursor-offset <int>", () => {
  runPrettier("cli", ["--cursor-offset", "2"], { input: " 1" }).test({
    status: 0
  });
});
