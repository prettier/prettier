describe("glob matching only ignored files warns", () => {
  runCli("cli/ignored-glob", ["ignored/*.js", "-l"]).test({
    status: 0,
    stdout: "",
    stderr: '[warn] All files matching the pattern "ignored/*.js" are ignored.',
    write: [],
  });
});

describe("glob matching some non-ignored files does not warn", () => {
  runCli("cli/ignored-glob", ["**/*.js", "-l"]).test({
    status: 0,
    stdout: "",
    stderr: "",
    write: [],
  });
});

describe("explicitly passed directory of ignored files does not warn", () => {
  runCli("cli/ignored-glob", ["all-ignored", "-l"]).test({
    status: 0,
    stdout: "",
    stderr: "",
    write: [],
  });
});

describe("glob warning is suppressed with --no-error-on-unmatched-pattern", () => {
  runCli("cli/ignored-glob", [
    "ignored/*.js",
    "-l",
    "--no-error-on-unmatched-pattern",
  ]).test({
    status: 0,
    stdout: "",
    stderr: "",
    write: [],
  });
});
