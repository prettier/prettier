import snapshotDiff from "snapshot-diff";
test("show external options with `--help`", async () => {
  const originalStdout = await runCli("plugins/options-string", ["--help"])
    .stdout;
  const pluggedStdout = await runCli("plugins/options-string", [
    "--help",
    "--plugin=./plugin.cjs",
  ]).stdout;
  expect(snapshotDiff(originalStdout, pluggedStdout)).toMatchSnapshot();
});

describe("show detailed external option with `--help foo-string`", () => {
  runCli("plugins/options-string", [
    "--plugin=./plugin.cjs",
    "--help",
    "foo-string",
  ]).test({
    status: 0,
  });
});

describe("external options from CLI should work", () => {
  runCli(
    "plugins/options-string",
    [
      "--plugin=./plugin.cjs",
      "--stdin-filepath",
      "example.foo",
      "--foo-string",
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
    "plugins/options-string",
    ["--config=./config.json", "--stdin-filepath", "example.foo"],
    { input: "hello-world" },
  ).test({
    stdout: "foo:baz",
    stderr: "",
    status: 0,
    write: [],
  });
});

describe("Non exists plugin", () => {
  runCli(
    "plugins/options-string",
    ["--plugin=--invalid--", "--stdin-filepath", "example.foo"],
    { input: "hello-world" },
  ).test({
    stdout: "",
    stderr: expect.stringMatching(/Cannot find package '--invalid--'/u),
    status: 1,
    write: [],
  });
});
