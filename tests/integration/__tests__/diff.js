"use strict";
const runPrettier = require("../run-prettier.js");

describe("checks stdin with --diff", () => {
  runPrettier("cli/with-shebang", ["--diff", "--parser", "babel"], {
    input: "0;\n",
  }).test({
    status: 0,
  });

  runPrettier("cli/with-shebang", ["--diff", "--parser", "babel"], {
    input: "var x      =      1;",
  }).test({
    status: 1,
  });
});

describe("checks files with --diff", () => {
  runPrettier(
    "cli/write",
    ["--diff", "formatted.js", "unformatted.js"],
  ).test({
    status: 1,
  });
});

describe("--diff works with --check", () => {
  const result0 = runPrettier(
    "cli/write",
    ["--diff", "--check", "formatted.js", "unformatted.js"],
  ).test({
    status: 1,
  });

  const result1 = runPrettier(
    "cli/write",
    ["--diff", "formatted.js", "unformatted.js"],
  ).test({
    status: 1,
  });

  test("`--diff` and `--diff --check` should behave identically", async () => {
    expect(await result0.stdout).toEqual(await result1.stdout);
  });
});

describe("--diff can't be used with --write", () => {
  runPrettier(
    "cli/write",
    ["--diff", "--write", "formatted.js"],
  ).test({
    status: 1,
  });
});
