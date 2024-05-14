describe("ignores", () => {
  it("should ignore files listed in package.json > prettier.ignores", () => {
    runCli("cli/ignores/package-json", ["*.js", "-l"]).test({
      status: 1,
    });
  });

  it("should ignore files listed in .prettierrc", () => {
    runCli("cli/ignores/prettierrc", ["*.js", "-l"]).test({
      status: 1,
    });
  });

  it("should ignore by --ignore-pattern flag", () => {
    runCli("cli/ignores/ignore-pattern", [
      "*.js",
      "--ignore-pattern",
      "ignored.*",
      "-l",
    ]).test({
      status: 1,
    });
  });
});
