"use strict";

const runPrettier = require("../run-prettier.js");

describe("print path of prettier ignore", () => {
  runPrettier("cli/config/", ["ignore/file.js", "--find-ignore-path"]).test({
    status: 0,
  });
});

describe("no print path for prettier ignore", () => {
  runPrettier("cli/config/", ["no-ignore/file.js", "--find-ignore-path"]).test({
    status: 0,
  });
});

describe("prints error message when no file found with --find-ignore-path", () => {
  runPrettier("cli/config/", [
    "--end-of-line",
    "lf",
    "--find-ignore-path",
    "..",
  ]).test({
    stdout: "",
    status: 1,
  });
});

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
    status: 0,
  });
});
