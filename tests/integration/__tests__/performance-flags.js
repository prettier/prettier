import runPrettier from "../run-prettier.js";

describe("should not write file or print code when `--debug-benchmark` or `--debug-repeat` found", () => {
  // Can't test `--debug-benchmark`, since it requires `benchmark` package
  runPrettier(
    "cli/performance-flags",
    ["--debug-repeat", "2", "--parser", "babel"],
    {
      input: "foo(    bar    )",
    }
  ).test({
    stderr: "",
    status: 0,
    stdout: "'--debug-repeat' option found, skipped print code to screen.\n",
    write: [],
  });

  runPrettier("cli/performance-flags", [
    "fixture.js",
    "--debug-repeat",
    "2",
    "--parser",
    "babel",
  ]).test({
    stderr: "",
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
    stderr: "",
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
    stderr: "",
    status: 0,
    stdout:
      "'--debug-repeat' option found, skipped print code or write files.\n",
    write: [],
  });
});
