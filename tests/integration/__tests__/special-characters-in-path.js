import jestPathSerializer from "../path-serializer.js";

expect.addSnapshotSerializer(jestPathSerializer);

describe("ignores file name contains emoji", () => {
  runCli("cli/special-characters-in-path/ignore-emoji", ["**/*.js", "-l"]).test(
    {
      status: 1,
    },
  );
});

describe("stdin", () => {
  runCli(
    "cli/special-characters-in-path/ignore-emoji",
    ["--stdin-filepath", "ignored/我的样式.css"],
    {
      input: ".name {                         display: none; }",
    },
  ).test({
    status: 0,
  });
});

// This is a failed test for #15188
describe("square-brackets-and-dash", () => {
  runCli("cli/special-characters-in-path/square-brackets-and-dash", [
    "test",
  ]).test({});
});
