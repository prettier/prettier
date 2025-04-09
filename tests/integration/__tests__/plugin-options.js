import snapshotDiff from "snapshot-diff";
test("show external options with `--help`", async () => {
  const originalStdout = await runCli("plugins/options", ["--help"]).stdout;
  const pluggedStdout = await runCli("plugins/options", [
    "--help",
    "--plugin=./plugin.cjs",
  ]).stdout;

  expect(snapshotDiff(originalStdout, pluggedStdout)).toMatchSnapshot();
});

describe("show detailed external option with `--help foo-option`", () => {
  runCli("plugins/options", [
    "--plugin=./plugin.cjs",
    "--help",
    "foo-option",
  ]).test({
    status: 0,
  });
});

describe("include plugin's parsers to the values of the `parser` option`", () => {
  runCli("plugins/options", ["--plugin=./plugin.cjs", "--help", "parser"]).test(
    {
      status: 0,
    },
  );
});

describe("external options from CLI should work", () => {
  runCli(
    "plugins/options",
    [
      "--plugin=./plugin.cjs",
      "--stdin-filepath",
      "example.foo",
      "--foo-option",
      "baz",
    ],
    { input: "hello-world" },
  ).test({
    stdout: "foo:baz",
    stderr: "",
    status: 0,
    write: [],
  });
});

describe("external options from config file should work", () => {
  runCli(
    "plugins/options",
    ["--config=./config.json", "--stdin-filepath", "example.foo"],
    { input: "hello-world" },
  ).test({
    stdout: "foo:baz",
    stderr: "",
    status: 0,
    write: [],
  });
});
