"use strict";

const runPrettier = require("../run-prettier.js");

describe("should not write file or print code when `--debug-benchmark` or `--debug-repeat` found", () => {
  const assertStderr = (message) => {
    expect(
      message.includes(
        "'--debug-repeat' option found, running formatWithCursor 2 times"
      )
    ).toBe(true);
  };

  // Can't test `--debug-benchmark`, since it requires `benchmark` package
  runPrettier(
    "cli/performance-flags",
    ["--debug-repeat", "2", "--parser", "babel"],
    { input: "foo(    bar    )" }
  ).test({
    stderr: assertStderr,
    status: 0,
    stdout: "'--debug-repeat' option found, skipped print code to screen.\n",
    write: [],
  });

  // The log level is always `debug`
  for (const logLevel of ["warn", "error", "debug", "log"]) {
    runPrettier(
      "cli/performance-flags",
      ["--debug-repeat", "2", "--parser", "babel", "--loglevel", logLevel],
      { input: "foo(    bar    )" }
    ).test({
      stderr: assertStderr,
      status: 0,
      stdout: "'--debug-repeat' option found, skipped print code to screen.\n",
      write: [],
    });
  }

  runPrettier("cli/performance-flags", [
    "fixture.js",
    "--debug-repeat",
    "2",
    "--parser",
    "babel",
  ]).test({
    stderr: assertStderr,
    status: 0,
    stdout:
      "'--debug-repeat' option found, skipped print code or write files.\n",
    write: [],
  });

  runPrettier("cli/performance-flags", [
    "fixture.js",
    "--debug-repeat",
    "2",
    "--parser",
    "babel",
    "--write",
  ]).test({
    stderr: assertStderr,
    status: 0,
    stdout:
      "'--debug-repeat' option found, skipped print code or write files.\n",
    write: [],
  });

  runPrettier("cli/performance-flags", [
    "fixture.js",
    "--debug-repeat",
    "2",
    "--parser",
    "babel",
    "--check",
  ]).test({
    stderr: assertStderr,
    status: 0,
    stdout:
      "'--debug-repeat' option found, skipped print code or write files.\n",
    write: [],
  });
});
