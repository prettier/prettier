"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

describe("multiple patterns", () => {
  runPrettier("cli/multiple-patterns", [
    "directory/**/*.js",
    "other-directory/**/*.js",
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

describe("multiple patterns with ignore nested directories pattern", () => {
  runPrettier("cli/multiple-patterns", [
    "**/*.js",
    "!**/nested-directory/**",
    "-l"
  ]).test({
    status: 1
  });
});

describe("multiple patterns by with ignore pattern, ignores node_modules by default", () => {
  runPrettier("cli/multiple-patterns", [
    "**/*.js",
    "!directory/**",
    "-l"
  ]).test({
    status: 1
  });
});

describe("multiple patterns by with ignore pattern, ignores node_modules by with ./**/*.js", () => {
  runPrettier("cli/multiple-patterns", [
    "./**/*.js",
    "!./directory/**",
    "-l"
  ]).test({
    status: 1
  });
});

describe("multiple patterns by with ignore pattern, doesn't ignore node_modules with --with-node-modules flag", () => {
  runPrettier("cli/multiple-patterns", [
    "**/*.js",
    "!directory/**",
    "-l",
    "--with-node-modules"
  ]).test({
    status: 1
  });
});

describe("no errors on empty patterns", () => {
  runPrettier("cli/multiple-patterns").test({
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
