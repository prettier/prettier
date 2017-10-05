"use strict";

const runPrettier = require("../runPrettier");

test("output with --list-different + unformatted differs when piped", () => {
  const result0 = runPrettier(
    "cli/write",
    ["--write", "--list-different", "--no-color", "unformated.js"],
    { stdoutIsTTY: true }
  );

  const result1 = runPrettier(
    "cli/write",
    ["--write", "--list-different", "--no-color", "unformated.js"],
    { stdoutIsTTY: false }
  );

  expect(result0.stdout).toMatchSnapshot();
  expect(result0.status).toEqual(1);

  expect(result1.stdout).toMatchSnapshot();
  expect(result1.status).toEqual(1);

  expect(result0.stdout).not.toEqual(result1.stdout);
  expect(result0.stdout.length).toBeGreaterThan(result1.stdout.length);
  expect(result0.write).toEqual(result1.write);
});

test("no file diffs with --list-different + formatted file", () => {
  const result0 = runPrettier(
    "cli/write",
    ["--write", "--list-different", "--no-color", "formated.js"],
    { stdoutIsTTY: true }
  );
  const result1 = runPrettier(
    "cli/write",
    ["--write", "--list-different", "--no-color", "formated.js"],
    { stdoutIsTTY: false }
  );

  expect(result0.write).toMatchSnapshot();
  expect(result0.status).toEqual(0);

  expect(result1.write).toMatchSnapshot();
  expect(result1.status).toEqual(0);

  expect(result0.stdout).not.toEqual(result1.stdout);
  expect(result0.stdout.length).toBeGreaterThan(result1.stdout.length);
  expect(result0.write).toEqual(result1.write);
});
