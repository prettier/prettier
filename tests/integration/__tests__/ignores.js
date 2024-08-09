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

  it("should ignore multiple --ignore-pattern flags", () => {
    runCli("cli/ignores/multi-ignore-pattern", [
      "*.js",
      "--ignore-pattern",
      "ignored.*",
      "--ignore-pattern",
      "ignored2.*",
      "-l",
    ]).test({
      status: 1,
    });
  });

  it("should ignore with glob-based value and --ignore-pattern flag", () => {
    runCli("cli/ignores/glob-ignore-pattern", [
      "*.js",
      "--ignore-pattern",
      "ignored.*",
      "!ignored2.*",
      "-l",
    ]).test({
      status: 1,
    });
  });

  it("should ignore with the closest config's ignores", () => {
    runCli("cli/ignores/multi-configs", ["**/*.js", "-l"]).test({
      status: 1,
    });
  });
});
