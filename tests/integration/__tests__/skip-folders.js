describe("skips folders in glob", () => {
  runCli("cli/skip-folders", ["**/*", "-l"]).test({
    status: 1,
    stderr: "",
  });
});

describe("skip folders passed specifically", () => {
  runCli("cli/skip-folders", ["a", "a/file.js", "b", "b/file.js", "-l"]).test({
    status: 1,
    stderr: "",
  });
});
