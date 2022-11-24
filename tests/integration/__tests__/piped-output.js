"use strict";

const runPrettier = require("../run-prettier.js");

describe("output with --check + unformatted differs when piped", () => {
  const cli0 = runPrettier(
    "cli/write",
    ["--write", "--check", "--no-color", "unformatted.js"],
    { stdoutIsTTY: true }
  ).test({
    status: 0,
  });

  const cli1 = runPrettier(
    "cli/write",
    ["--write", "--check", "--no-color", "unformatted.js"],
    { stdoutIsTTY: false }
  ).test({
    status: 0,
  });

  test("Result", async () => {
    const result0 = await cli0;
    const result1 = await cli1;

    expect(result0.stdout.length).toBeGreaterThan(result1.stdout.length);
    expect(result0.write).toEqual(result1.write);
  });
});

describe("no file diffs with --check + formatted file", () => {
  const cli0 = runPrettier(
    "cli/write",
    ["--write", "--check", "--no-color", "formatted.js"],
    { stdoutIsTTY: true }
  ).test({
    status: 0,
  });

  const cli1 = runPrettier(
    "cli/write",
    ["--write", "--check", "--no-color", "formatted.js"],
    { stdoutIsTTY: false }
  ).test({
    status: 0,
  });

  test("Result", async () => {
    const result0 = await cli0;
    const result1 = await cli1;

    expect(result0.stdout).not.toEqual(result1.stdout);
    expect(result0.stdout.length).toBeGreaterThan(result1.stdout.length);
    expect(result0.write).toEqual(result1.write);
  });
});

describe("output with --list-different + unformatted differs when piped", () => {
  const cli0 = runPrettier(
    "cli/write",
    ["--write", "--list-different", "--no-color", "unformatted.js"],
    { stdoutIsTTY: true }
  ).test({
    status: 0,
  });

  const cli1 = runPrettier(
    "cli/write",
    ["--write", "--list-different", "--no-color", "unformatted.js"],
    { stdoutIsTTY: false }
  ).test({
    status: 0,
  });

  test("Result", async () => {
    const result0 = await cli0;
    const result1 = await cli1;

    expect(result0.stdout.length).toBeGreaterThan(result1.stdout.length);
    expect(result0.write).toEqual(result1.write);
  });
});

describe("no file diffs with --list-different + formatted file", () => {
  const cli0 = runPrettier(
    "cli/write",
    ["--write", "--list-different", "--no-color", "formatted.js"],
    { stdoutIsTTY: true }
  ).test({
    status: 0,
  });

  const cli1 = runPrettier(
    "cli/write",
    ["--write", "--list-different", "--no-color", "formatted.js"],
    { stdoutIsTTY: false }
  ).test({
    status: 0,
  });

  test("Result", async () => {
    const result0 = await cli0;
    const result1 = await cli1;

    expect(result0.stdout).not.toEqual(result1.stdout);
    expect(result0.stdout.length).toBeGreaterThan(result1.stdout.length);
    expect(result0.write).toEqual(result1.write);
  });
});
