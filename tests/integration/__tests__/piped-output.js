"use strict";

const runPrettier = require("../runPrettier");

describe("output with --check + unformatted differs when piped", () => {
  const result0 = runPrettier(
    "cli/write",
    ["--write", "--check", "--no-color", "unformatted.js"],
    { stdoutIsTTY: true }
  ).test({
    status: 0,
  });

  const result1 = runPrettier(
    "cli/write",
    ["--write", "--check", "--no-color", "unformatted.js"],
    { stdoutIsTTY: false }
  ).test({
    status: 0,
  });

  test("Result", async () => {
    expect((await result0.stdout).length).toBeGreaterThan(
      (await result1.stdout).length
    );
    expect(await result0.write).toEqual(await result1.write);
  });
});

describe("no file diffs with --check + formatted file", () => {
  const result0 = runPrettier(
    "cli/write",
    ["--write", "--check", "--no-color", "formatted.js"],
    { stdoutIsTTY: true }
  ).test({
    status: 0,
  });

  const result1 = runPrettier(
    "cli/write",
    ["--write", "--check", "--no-color", "formatted.js"],
    { stdoutIsTTY: false }
  ).test({
    status: 0,
  });

  test("Result", async () => {
    expect(await result0.stdout).not.toEqual(await result1.stdout);
    expect((await result0.stdout).length).toBeGreaterThan(
      (await result1.stdout).length
    );
    expect(await result0.write).toEqual(await result1.write);
  });
});

describe("output with --list-different + unformatted differs when piped", () => {
  const result0 = runPrettier(
    "cli/write",
    ["--write", "--list-different", "--no-color", "unformatted.js"],
    { stdoutIsTTY: true }
  ).test({
    status: 0,
  });

  const result1 = runPrettier(
    "cli/write",
    ["--write", "--list-different", "--no-color", "unformatted.js"],
    { stdoutIsTTY: false }
  ).test({
    status: 0,
  });

  test("Result", async () => {
    expect((await result0.stdout).length).toBeGreaterThan(
      (await result1.stdout).length
    );
    expect(await result0.write).toEqual(await result1.write);
  });
});

describe("no file diffs with --list-different + formatted file", () => {
  const result0 = runPrettier(
    "cli/write",
    ["--write", "--list-different", "--no-color", "formatted.js"],
    { stdoutIsTTY: true }
  ).test({
    status: 0,
  });

  const result1 = runPrettier(
    "cli/write",
    ["--write", "--list-different", "--no-color", "formatted.js"],
    { stdoutIsTTY: false }
  ).test({
    status: 0,
  });

  test("Result", async () => {
    expect(await result0.stdout).not.toEqual(await result1.stdout);
    expect((await result0.stdout).length).toBeGreaterThan(
      (await result1.stdout).length
    );
    expect(await result0.write).toEqual(await result1.write);
  });
});
