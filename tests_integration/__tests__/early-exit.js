"use strict";

const prettier = require("../../tests_config/require_prettier");
const runPrettier = require("../runPrettier");
const constant = require("../../src/cli-constant");

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

test(`show detailed usage with --help l (alias)`, () => {
  const result = runPrettier("cli", ["--help", "l"]);
  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(0);
});

constant.detailedOptions.forEach(option => {
  const optionNames = [
    option.description ? option.name : null,
    option.oppositeDescription ? `no-${option.name}` : null
  ].filter(Boolean);

  optionNames.forEach(optionName => {
    test(`show detailed usage with --help ${optionName}`, () => {
      const result = runPrettier("cli", ["--help", optionName]);
      expect(result.stdout).toMatchSnapshot();
      expect(result.status).toEqual(0);
    });
  });
});

test("show warning with --help not-found", () => {
  const result = runPrettier("cli", ["--help", "not-found"]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.stderr).toMatchSnapshot();
  expect(result.status).toEqual(0);
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
