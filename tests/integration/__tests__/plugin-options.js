"use strict";

const snapshotDiff = require("snapshot-diff");
const runPrettier = require("../runPrettier");

test("show external options with `--help`", async () => {
  const originalStdout = await runPrettier("plugins/options", ["--help"])
    .stdout;
  const pluggedStdout = await runPrettier("plugins/options", [
    "--help",
    "--plugin=./plugin",
  ]).stdout;

  expect(snapshotDiff(originalStdout, pluggedStdout)).toMatchSnapshot();
});

describe("show detailed external option with `--help foo-option`", () => {
  runPrettier("plugins/options", [
    "--plugin=./plugin",
    "--help",
    "foo-option",
  ]).test({
    status: 0,
  });
});

describe("include plugin's parsers to the values of the `parser` option`", () => {
  runPrettier("plugins/options", [
    "--plugin=./plugin",
    "--help",
    "parser",
  ]).test({
    status: 0,
  });
});

describe("external options from CLI should work", () => {
  runPrettier(
    "plugins/options",
    [
      "--plugin=./plugin",
      "--stdin-filepath",
      "example.foo",
      "--foo-option",
      "baz",
    ],
    { input: "hello-world" }
  ).test({
    stdout: "foo:baz",
    stderr: "",
    status: 0,
    write: [],
  });
});

describe("external options from config file should work", () => {
  runPrettier(
    "plugins/options",
    ["--config=./config.json", "--stdin-filepath", "example.foo"],
    { input: "hello-world" }
  ).test({
    stdout: "foo:baz",
    stderr: "",
    status: 0,
    write: [],
  });
});
