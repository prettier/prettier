describe("boolean flags do not swallow the next argument", () => {
  runCli("cli/arg-parsing", [
    "--end-of-line",
    "lf",
    "--single-quote",
    "file.js",
  ]).test({
    status: 0,
  });
});

describe("negated options work", () => {
  runCli("cli/arg-parsing", [
    "--end-of-line",
    "lf",
    "--no-semi",
    "file.js",
  ]).test({
    status: 0,
  });
});

describe("unknown options are warned", () => {
  runCli("cli/arg-parsing", [
    "--end-of-line",
    "lf",
    "file.js",
    "--unknown",
  ]).test({
    status: 0,
  });
});

describe("unknown negated options are warned", () => {
  runCli("cli/arg-parsing", [
    "--end-of-line",
    "lf",
    "file.js",
    "--no-unknown",
  ]).test({
    status: 0,
  });
});

describe("unknown options not suggestion `_`", () => {
  runCli("cli/arg-parsing", ["file.js", "-a"]).test({
    status: 0,
    write: [],
  });
});

describe("allow overriding flags", () => {
  runCli(
    "cli/arg-parsing",
    ["--tab-width=1", "--tab-width=3", "--parser=babel"],
    { input: "function a() { b }" },
  ).test({
    stdout: "function a() {\n   b;\n}",
    status: 0,
  });
});

describe("number file/dir", () => {
  const patterns = ["1", "2.2", "3", "4.44"];
  for (const pattern of patterns) {
    runCli("cli/arg-parsing/number", [
      "--parser=babel",
      "--list-different",
      pattern,
    ]).test({
      stderr: "",
      status: 1,
      write: [],
    });
  }
  runCli("cli/arg-parsing/number", [
    "--parser=babel",
    "--list-different",
    ...patterns,
  ]).test({
    stderr: "",
    status: 1,
    write: [],
  });
});

describe("deprecated option values are warned", () => {
  runCli("cli/arg-parsing", ["file.js", "--jsx-bracket-same-line"]).test({
    status: 0,
  });
});

describe("options with `cliName` should not allow to pass directly", () => {
  // `filepath` can only pass through `--stdin-filepath`
  // `plugins` works the same
  runCli("cli/arg-parsing", ["--stdin-filepath", "file.js"], {
    isTTY: false,
    input: "prettier()",
  }).test({ status: 0, stderr: "", write: [] });
  runCli("cli/arg-parsing", ["--filepath", "file.js"], {
    isTTY: false,
    input: "prettier()",
  }).test({ status: 2, write: [] });
});
