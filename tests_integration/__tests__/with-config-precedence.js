"use strict";

const runPrettier = require("../runPrettier");

test("CLI overrides take precedence without --config-precedence", () => {
  const output = runPrettier("cli/config/", ["--print-width", "1", "**/*.js"]);
  expect(output.stdout).toMatchSnapshot();
  expect(output.status).toEqual(0);
});

test("CLI overrides take precedence with --config-precedence cli-override", () => {
  const output = runPrettier("cli/config/", [
    "--print-width",
    "1",
    "--config-precedence",
    "cli-override",
    "**/*.js"
  ]);
  expect(output.stdout).toMatchSnapshot();
  expect(output.status).toEqual(0);
});

test("CLI overrides take lower precedence with --config-precedence file-override", () => {
  const output = runPrettier("cli/config/js/", [
    "--tab-width",
    "1",
    "--config-precedence",
    "file-override",
    "**/*.js"
  ]);
  expect(output.stdout).toMatchSnapshot();
  expect(output.status).toEqual(0);
});

test("CLI overrides are still applied when no config is found with --config-precedence file-override", () => {
  const output = runPrettier("cli/config/no-config/", [
    "--tab-width",
    "6",
    "--config-precedence",
    "file-override",
    "**/*.js"
  ]);
  expect(output.stdout).toMatchSnapshot();
  expect(output.status).toEqual(0);
});

test("CLI overrides gets ignored when config exists with --config-precedence prefer-file", () => {
  const output = runPrettier("cli/config/js/", [
    "--print-width",
    "1",
    "--tab-width",
    "1",
    "--config-precedence",
    "prefer-file",
    "**/*.js"
  ]);
  expect(output.stdout).toMatchSnapshot();
  expect(output.status).toEqual(0);
});

test("CLI overrides gets applied when no config exists with --config-precedence prefer-file", () => {
  const output = runPrettier("cli/config/no-config/", [
    "--print-width",
    "1",
    "--tab-width",
    "7",
    "--no-config",
    "--config-precedence",
    "prefer-file",
    "**/*.js"
  ]);
  expect(output.stdout).toMatchSnapshot();
  expect(output.status).toEqual(0);
});
