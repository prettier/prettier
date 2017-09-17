"use strict";

const prettier = require("../..");
const runPrettier = require("../runPrettier");

test("show version with --version", () => {
  const result = runPrettier("cli/with-shebang", ["--version"]);

  expect(result.stdout).toBe(prettier.version + "\n");
  expect(result.status).toEqual(0);
});

test("show usage with --help", () => {
  const result = runPrettier("cli", ["--help"]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(0);
});

test("show detailed usage with --help trailing-comma", () => {
  const result = runPrettier("cli", ["--help", "trailing-comma"]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(0);
});

test("show detailed usage with --help config-precedence", () => {
  const result = runPrettier("cli", ["--help", "config-precedence"]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(0);
});

test("show detailed usage with --help cursor-offset", () => {
  const result = runPrettier("cli", ["--help", "cursor-offset"]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(0);
});

test("show detailed usage with --help parser", () => {
  const result = runPrettier("cli", ["--help", "parser"]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(0);
});

test("show detailed usage with --help no-option", () => {
  const result = runPrettier("cli", ["--help", "no-semi"]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(0);
});

test("throw error with --help not-found", () => {
  const result = runPrettier("cli", ["--help", "not-found"]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.stderr).toMatchSnapshot();
  expect(result.status).not.toEqual(0);
});

test("show warning with --help not-found (typo)", () => {
  const result = runPrettier("cli", ["--help", "parserr"]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.stderr).toMatchSnapshot();
  expect(result.status).toEqual(0);
});

test("throw error with --write + --debug-check", () => {
  const result = runPrettier("cli", ["--write", "--debug-check"]);

  expect(result.stderr).toMatchSnapshot();
  expect(result.status).toEqual(1);
});

test("throw error with --find-config-path + multiple files", () => {
  const result = runPrettier("cli", ["--find-config-path", "abc.js", "def.js"]);

  expect(result.stderr).toMatchSnapshot();
  expect(result.status).toEqual(1);
});

test("throw error and show usage with something unexpected", () => {
  const result = runPrettier("cli", [], { isTTY: true });

  expect(result.stdout).toMatchSnapshot();
  expect(result.stderr).toMatchSnapshot();
  expect(result.status).not.toEqual(0);
});
