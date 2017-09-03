"use strict";

const path = require("path");

const runPrettier = require("../runPrettier");
const prettier = require("../../");

test("resolves configuration from external files", () => {
  const output = runPrettier.sync("cli/config/", ["**/*.js"]);
  expect(output.stdout).toMatchSnapshot();
  expect(output.status).toEqual(0);
});

test("resolves configuration from external files and overrides by extname", () => {
  const output = runPrettier.sync("cli/config/", ["**/*.ts"]);
  expect(output.stdout).toMatchSnapshot();
  expect(output.status).toEqual(0);
});

test("accepts configuration from --config", () => {
  const output = runPrettier.sync("cli/config/", [
    "--config",
    ".prettierrc",
    "./js/file.js"
  ]);
  expect(output.stdout).toMatchSnapshot();
  expect(output.status).toEqual(0);
});

test("resolves configuration file with --find-config-path file", () => {
  const output = runPrettier.sync("cli/config/", [
    "--find-config-path",
    "no-config/file.js"
  ]);
  expect(output.stdout).toMatchSnapshot();
  expect(output.status).toEqual(0);
});

test("prints nothing when no file found with --find-config-path", () => {
  const output = runPrettier.sync("cli/config/", ["--find-config-path", ".."]);
  expect(output.stdout).toEqual("");
  expect(output.status).toEqual(1);
});

test("CLI overrides take precedence", () => {
  const output = runPrettier.sync("cli/config/", ["--print-width", "1", "**/*.js"]);
  expect(output.stdout).toMatchSnapshot();
  expect(output.status).toEqual(0);
});

test("API resolveConfig with no args", () => {
  return prettier.resolveConfig().then(result => {
    expect(result).toBeNull();
  });
});

test("API resolveConfig.sync with no args", () => {
  expect(prettier.resolveConfig.sync()).toBeNull();
});

test("API resolveConfig with file arg", () => {
  const file = path.resolve(path.join(__dirname, "../cli/config/js/file.js"));
  return prettier.resolveConfig(file).then(result => {
    expect(result).toMatchObject({
      tabWidth: 8
    });
  });
});

test("API resolveConfig.sync with file arg", () => {
  const file = path.resolve(path.join(__dirname, "../cli/config/js/file.js"));
  expect(prettier.resolveConfig.sync(file)).toMatchObject({
    tabWidth: 8
  });
});

test("API resolveConfig with file arg and extension override", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/no-config/file.ts")
  );
  return prettier.resolveConfig(file).then(result => {
    expect(result).toMatchObject({
      semi: true
    });
  });
});

test("API resolveConfig.sync with file arg and extension override", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/no-config/file.ts")
  );
  expect(prettier.resolveConfig.sync(file)).toMatchObject({
    semi: true
  });
});
