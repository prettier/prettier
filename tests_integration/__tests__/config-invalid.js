"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../cwd-serializer"));

test("throw error with invalid config format", () => {
  const output = runPrettier("cli/config/invalid", [
    "--config",
    "file/.prettierrc"
  ]);
  expect(output.stderr).toMatchSnapshot();
  expect(output.status).not.toBe(0);
});

test("throw error with invalid config target (directory)", () => {
  const output = runPrettier("cli/config/invalid", [
    "--config",
    "folder/.prettierrc" // this is a directory
  ]);
  expect(output.stderr).toMatchSnapshot();
  expect(output.status).not.toBe(0);
});

test("throw error with invalid config option (int)", () => {
  const output = runPrettier("cli/config/invalid", ["--config", "option/int"]);
  expect(output.stderr).toMatchSnapshot();
  expect(output.status).not.toBe(0);
});

test("throw error with invalid config option (trailingComma)", () => {
  const output = runPrettier("cli/config/invalid", [
    "--config",
    "option/trailingComma"
  ]);
  expect(output.stderr).toMatchSnapshot();
  expect(output.status).not.toBe(0);
});
