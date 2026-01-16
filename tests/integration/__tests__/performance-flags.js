describe("should not write file or print code when `--debug-benchmark` or `--debug-repeat` found", () => {
  const assertStderr = (message) => {
    expect(
      message.includes(
        "'--debug-repeat' found, running formatWithCursor 2 times",
      ),
    ).toBe(true);
  };

  // Can't test `--debug-benchmark`, since it requires `tinybench` package
  runCli(
    "cli/performance-flags",
    ["--debug-repeat", "2", "--parser", "babel"],
    { input: "foo(    bar    )" },
  ).test({
    stderr: assertStderr,
    status: 0,
    stdout: "'--debug-repeat' option found, skipped print code to screen.",
    write: [],
  });

  // The log level is always `debug`
  for (const logLevel of ["warn", "error", "debug", "log"]) {
    runCli(
      "cli/performance-flags",
      ["--debug-repeat", "2", "--parser", "babel", "--log-level", logLevel],
      { input: "foo(    bar    )" },
    ).test({
      stderr: assertStderr,
      status: 0,
      stdout: "'--debug-repeat' option found, skipped print code to screen.",
      write: [],
    });
  }

  runCli("cli/performance-flags", [
    "fixture.js",
    "--debug-repeat",
    "2",
    "--parser",
    "babel",
  ]).test({
    stderr: assertStderr,
    status: 0,
    stdout: "'--debug-repeat' option found, skipped print code or write files.",
    write: [],
  });

  runCli("cli/performance-flags", [
    "fixture.js",
    "--debug-repeat",
    "2",
    "--parser",
    "babel",
    "--write",
  ]).test({
    stderr: assertStderr,
    status: 0,
    stdout: "'--debug-repeat' option found, skipped print code or write files.",
    write: [],
  });

  runCli("cli/performance-flags", [
    "fixture.js",
    "--debug-repeat",
    "2",
    "--parser",
    "babel",
    "--check",
  ]).test({
    stderr: assertStderr,
    status: 0,
    stdout: "'--debug-repeat' option found, skipped print code or write files.",
    write: [],
  });
});
