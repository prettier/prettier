"use strict";

const path = require("path");

const runPrettier = require("../runPrettier");
const prettier = require("../../");

test("resolves configuration from external files", () => {
  const output = runPrettier("cli/config/", ["**/*.js"]);
  expect(output.stdout).toMatchSnapshot();
  expect(output.status).toEqual(0);
});

test("resolves configuration from external files and overrides by extname", () => {
  const output = runPrettier("cli/config/", ["**/*.ts"]);
  expect(output.stdout).toMatchSnapshot();
  expect(output.status).toEqual(0);
});

test("CLI overrides take precedence", () => {
  const output = runPrettier("cli/config/", ["--print-width", "1", "**/*.js"]);
  expect(output.stdout).toMatchSnapshot();
  expect(output.status).toEqual(0);
});

test("API resolveOptions with no args", () => {
  return prettier.resolveOptions().then(result => {
    expect(result).toMatchObject({});
  });
});

test("API resolveOptions with file arg", () => {
  const file = path.resolve(path.join(__dirname, "../cli/config/js/file.js"));
  return prettier.resolveOptions(file).then(result => {
    expect(result).toMatchObject({
      tabWidth: 8
    });
  });
});

test("API resolveOptions with file arg and extension override", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/no-config/file.ts")
  );
  return prettier.resolveOptions(file).then(result => {
    expect(result).toMatchObject({
      semi: true
    });
  });
});
