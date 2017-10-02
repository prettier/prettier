"use strict";

const runPrettier = require("../runPrettier");

describe("write file with --write + unformated file", () => {
  runPrettier("cli/write", ["--write", "unformated.js"]).test({
    status: 0
  });
});

describe("do not write file with --write + formated file", () => {
  runPrettier("cli/write", ["--write", "formated.js"]).test({
    write: [],
    status: 0
  });
});

describe("do not write file with --write + invalid file", () => {
  runPrettier("cli/write", ["--write", "invalid.js", "--no-color"]).test({
    write: [],
    status: "non-zero"
  });
});
