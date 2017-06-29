"use strict";

const runPrettier = require("../runPrettier");

test("multiple patterns", () => {
  const result = runPrettier("cli/multiple-patterns", [
    "directory/**/*.js",
    "other-directory/**/*.js",
    "-l"
  ]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(1);
});

test("multiple patterns with non exists pattern", () => {
  const result = runPrettier("cli/multiple-patterns", [
    "directory/**/*.js",
    "non-existent.js",
    "-l"
  ]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(1);
});

test("multiple patterns with ignore nested directories pattern", () => {
  const result = runPrettier("cli/multiple-patterns", [
    "**/*.js",
    "!**/nested-directory/**",
    "-l"
  ]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(1);
});

test("multiple patterns by with ignore pattern, ignores node_modules by default", () => {
  const result = runPrettier("cli/multiple-patterns", [
    "**/*.js",
    "!directory/**",
    "-l"
  ]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(1);
});

test("multiple patterns by with ignore pattern, ignores node_modules by with ./**/*.js", () => {
  const result = runPrettier("cli/multiple-patterns", [
    "./**/*.js",
    "!./directory/**",
    "-l"
  ]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(1);
});

test("multiple patterns by with ignore pattern, doesn't ignore node_modules with --with-node-modules flag", () => {
  const result = runPrettier("cli/multiple-patterns", [
    "**/*.js",
    "!directory/**",
    "-l",
    "--with-node-modules"
  ]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(1);
});

test("no errors on empty patterns", () => {
  const result = runPrettier("cli/multiple-patterns");

  expect(result.status).toEqual(0);
});

test("multiple patterns, throw error and exit with non zero code on non existing files", () => {
  const result = runPrettier("cli/multiple-patterns", [
    "non-existent.js",
    "other-non-existent.js",
    "-l"
  ]);

  expect(result.stderr).toMatchSnapshot();
  expect(result.status).toEqual(2);
});
