"use strict";

const runPrettier = require("../runPrettier");

test("boolean flags do not swallow the next argument", () => {
  const result = runPrettier.sync("cli/arg-parsing", [
    "--single-quote",
    "file.js"
  ]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.stderr).toMatchSnapshot();
  expect(result.status).toEqual(0);
});

test("negated options work", () => {
  const result = runPrettier.sync("cli/arg-parsing", ["--no-semi", "file.js"]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.stderr).toMatchSnapshot();
  expect(result.status).toEqual(0);
});

test("unknown options are warned", () => {
  const result = runPrettier.sync("cli/arg-parsing", ["file.js", "--unknown"]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.stderr).toMatchSnapshot();
  expect(result.status).toEqual(0);
});

test("unknown negated options are warned", () => {
  const result = runPrettier.sync("cli/arg-parsing", [
    "file.js",
    "--no-unknown"
  ]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.stderr).toMatchSnapshot();
  expect(result.status).toEqual(0);
});
