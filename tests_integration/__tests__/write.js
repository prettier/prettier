"use strict";

const runPrettier = require("../runPrettier");

describe("write file with --write + unformatted file", () => {
  runPrettier("cli/write", ["--write", "unformatted.js"]).test({
    status: 0,
  });
});

describe("exit with error code with --check and --force-error-on-written-files on unformatted file", () => {
  runPrettier("cli/write", [
    "--check",
    "--force-error-on-written-files",
    "-w",
    "unformatted.js",
  ]).test({
    status: "non-zero",
  });
});

describe("write file with -w + unformatted file", () => {
  runPrettier("cli/write", ["-w", "unformatted.js"]).test({
    status: 0,
  });
});

describe("do not write file with --write + formatted file", () => {
  runPrettier("cli/write", ["--write", "formatted.js"]).test({
    write: [],
    status: 0,
  });
});

describe("do not write file with --write + invalid file", () => {
  runPrettier("cli/write", ["--write", "invalid.js"]).test({
    write: [],
    status: "non-zero",
  });
});
