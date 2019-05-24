"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

describe("multiple patterns", () => {
  runPrettier("cli/multiple-patterns", [
    "directory",
    "other-directory",
    "-l"
  ]).test({
    status: 1
  });
});

describe("multiple patterns with non exists pattern", () => {
  runPrettier("cli/multiple-patterns", [
    "directory/**/*.js",
    "non-existent.js",
    "-l"
  ]).test({
    status: 1
  });
});

describe("no errors on empty patterns", () => {
  // --parser is mandatory if no filepath is passed
  runPrettier("cli/multiple-patterns", ["--parser", "babel"]).test({
    status: 0
  });
});

describe("multiple patterns, throw error and exit with non zero code on non existing files", () => {
  runPrettier("cli/multiple-patterns", [
    "non-existent.js",
    "other-non-existent.js",
    "-l"
  ]).test({
    status: 2
  });
});
