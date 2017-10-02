"use strict";

const runPrettier = require("../runPrettier");

describe("infers postcss parser", () => {
  runPrettier("cli/with-parser-inference", ["*"]).test({
    status: 0
  });
});

describe("infers postcss parser with --list-different", () => {
  runPrettier("cli/with-parser-inference", ["--list-different", "*"]).test({
    status: 0
  });
});
