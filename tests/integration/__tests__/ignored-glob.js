describe("glob matching only ignored files warns", () => {
  runCli("cli/ignored-glob", ["ignored/*.js", "-l"]).test({
    status: 0,
    stdout: "",
    stderr: '[warn] All files matching the pattern "ignored/*.js" are ignored.',
    write: [],
  });
});

describe("glob matching only ignored files warns and writes nothing with --write", () => {
  runCli("cli/ignored-glob", ["ignored/*.js", "--write"]).test({
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

// A fully-ignored glob must warn even when an earlier, overlapping glob already
// consumed its files. Per-glob assessment (against each glob's own complete
// match set, before dedup) makes this order-independent; counting surviving
// files after dedup would miss it.
describe("fully-ignored glob warns even when an overlapping glob keeps files", () => {
  runCli("cli/ignored-glob", ["**/*.js", "ignored/*.js", "-l"]).test({
    status: 0,
    stdout: "",
    stderr: '[warn] All files matching the pattern "ignored/*.js" are ignored.',
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
