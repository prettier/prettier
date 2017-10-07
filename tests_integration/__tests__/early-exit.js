"use strict";

const prettier = require("../../tests_config/require_prettier");
const runPrettier = require("../runPrettier");
const constant = require("../../src/cli-constant");

describe("show version with --version", () => {
  runPrettier("cli/with-shebang", ["--version"]).test({
    stdout: prettier.version + "\n",
    status: 0
  });
});

describe("show usage with --help", () => {
  runPrettier("cli", ["--help"]).test({
    status: 0
  });
});

describe(`show detailed usage with --help l (alias)`, () => {
  runPrettier("cli", ["--help", "l"]).test({
    status: 0
  });
});

constant.detailedOptions.forEach(option => {
  const optionNames = [
    option.description ? option.name : null,
    option.oppositeDescription ? `no-${option.name}` : null
  ].filter(Boolean);

  optionNames.forEach(optionName => {
    describe(`show detailed usage with --help ${optionName}`, () => {
      runPrettier("cli", ["--help", optionName]).test({
        status: 0
      });
    });
  });
});

describe("show warning with --help not-found", () => {
  runPrettier("cli", ["--help", "not-found"]).test({
    status: 0
  });
});

describe("show warning with --help not-found (typo)", () => {
  runPrettier("cli", ["--help", "parserr"]).test({
    status: 0
  });
});

describe("throw error with --write + --debug-check", () => {
  runPrettier("cli", ["--write", "--debug-check"]).test({
    status: 1
  });
});

describe("throw error with --find-config-path + multiple files", () => {
  runPrettier("cli", ["--find-config-path", "abc.js", "def.js"]).test({
    status: 1
  });
});

describe("throw error and show usage with something unexpected", () => {
  runPrettier("cli", [], { isTTY: true }).test({
    status: "non-zero"
  });
});
