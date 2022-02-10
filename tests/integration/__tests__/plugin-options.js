import snapshotDiff from "snapshot-diff";
import runPrettier from "../run-prettier.js";

test("show external options with `--help`", async () => {
  const originalStdout = await runPrettier("plugins/options", ["--help"])
    .stdout;
  const pluggedStdout = await runPrettier("plugins/options", [
    "--help",
    "--plugin=./plugin.cjs",
  ]).stdout;

  expect(snapshotDiff(originalStdout, pluggedStdout)).toMatchSnapshot();
});

describe("show detailed external option with `--help foo-option`", () => {
  runPrettier("plugins/options", [
    "--plugin=./plugin.cjs",
    "--help",
    "foo-option",
  ]).test({
    status: 0,
  });
});

describe("include plugin's parsers to the values of the `parser` option`", () => {
  runPrettier("plugins/options", [
    "--plugin=./plugin.cjs",
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
      "--plugin=./plugin.cjs",
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
