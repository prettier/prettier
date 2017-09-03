"use strict";

const runPrettier = require("../runPrettier");

test("write file with --write + unformated file", () => {
  const result = runPrettier("cli/write", ["--write", "unformated.js"]);

  expect(result.write).toMatchSnapshot();
  expect(result.status).toEqual(0);
});

test("do not write file with --write + formated file", () => {
  const result = runPrettier("cli/write", ["--write", "formated.js"]);

  expect(result.write).toHaveLength(0);
  expect(result.status).toEqual(0);
});

test("do not write file with --write + invalid file", () => {
  const result = runPrettier("cli/write", ["--write", "invalid.js"]);

  expect(result.stderr).toMatchSnapshot();
  expect(result.write).toHaveLength(0);
  expect(result.status).not.toEqual(0);
});
