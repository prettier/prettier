"use strict";

const path = require("path");

const runPrettier = require("../runPrettier");
const prettier = require("../../tests_config/require_prettier");

expect.addSnapshotSerializer(require("../path-serializer"));

describe("resolves configuration from external files", () => {
  runPrettier("cli/config/", ["**/*.js"]).test({
    status: 0
  });
});

describe("resolves configuration from external files and overrides by extname", () => {
  runPrettier("cli/config/", ["**/*.ts"]).test({
    status: 0
  });
});

describe("accepts configuration from --config", () => {
  runPrettier("cli/config/", ["--config", ".prettierrc", "./js/file.js"]).test({
    status: 0
  });
});

describe("resolves configuration file with --find-config-path file", () => {
  runPrettier("cli/config/", ["--find-config-path", "no-config/file.js"]).test({
    status: 0
  });
});

describe("resolves json configuration file with --find-config-path file", () => {
  runPrettier("cli/config/", ["--find-config-path", "rc-json/file.js"]).test({
    status: 0
  });
});

describe("resolves yaml configuration file with --find-config-path file", () => {
  runPrettier("cli/config/", ["--find-config-path", "rc-yaml/file.js"]).test({
    status: 0
  });
});

describe("prints nothing when no file found with --find-config-path", () => {
  runPrettier("cli/config/", ["--find-config-path", ".."]).test({
    stdout: "",
    status: 1
  });
});

describe("CLI overrides take precedence", () => {
  runPrettier("cli/config/", ["--print-width", "1", "**/*.js"]).test({
    status: 0
  });
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

test("API resolveConfig with file arg and .editorconfig", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/file.js")
  );
  return prettier.resolveConfig(file, { editorconfig: true }).then(result => {
    expect(result).toMatchObject({
      useTabs: true,
      tabWidth: 8,
      printWidth: 100
    });
  });
});

test("API resolveConfig.sync with file arg and .editorconfig", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/file.js")
  );

  expect(prettier.resolveConfig.sync(file)).toMatchObject({
    semi: false
  });

  expect(
    prettier.resolveConfig.sync(file, { editorconfig: true })
  ).toMatchObject({
    useTabs: true,
    tabWidth: 8,
    printWidth: 100
  });
});

test("API resolveConfig with nested file arg and .editorconfig", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/lib/file.js")
  );
  return prettier.resolveConfig(file, { editorconfig: true }).then(result => {
    expect(result).toMatchObject({
      useTabs: false,
      tabWidth: 2,
      printWidth: 100
    });
  });
});

test("API resolveConfig.sync with nested file arg and .editorconfig", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/lib/file.js")
  );

  expect(prettier.resolveConfig.sync(file)).toMatchObject({
    semi: false
  });

  expect(
    prettier.resolveConfig.sync(file, { editorconfig: true })
  ).toMatchObject({
    useTabs: false,
    tabWidth: 2,
    printWidth: 100
  });
});

test("API resolveConfig with nested file arg and .editorconfig and indent_size = tab", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/lib/indent_size=tab.js")
  );
  return prettier.resolveConfig(file, { editorconfig: true }).then(result => {
    expect(result).toMatchObject({
      useTabs: false,
      tabWidth: 8,
      printWidth: 100
    });
  });
});

test("API resolveConfig.sync with nested file arg and .editorconfig and indent_size = tab", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/lib/indent_size=tab.js")
  );

  expect(prettier.resolveConfig.sync(file)).toMatchObject({
    semi: false
  });

  expect(
    prettier.resolveConfig.sync(file, { editorconfig: true })
  ).toMatchObject({
    useTabs: false,
    tabWidth: 8,
    printWidth: 100
  });
});

test("API clearConfigCache", () => {
  expect(() => prettier.clearConfigCache()).not.toThrowError();
});

test("API resolveConfig.sync overrides work with absolute paths", () => {
  // Absolute path
  const file = path.join(__dirname, "../cli/config/filepath/subfolder/file.js");
  expect(prettier.resolveConfig.sync(file)).toMatchObject({
    tabWidth: 6
  });
});

test("API resolveConfig removes $schema option", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/$schema/index.js")
  );
  return prettier.resolveConfig(file).then(result => {
    expect(result).toEqual({
      tabWidth: 42
    });
  });
});

test("API resolveConfig.sync removes $schema option", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/$schema/index.js")
  );
  expect(prettier.resolveConfig.sync(file)).toEqual({
    tabWidth: 42
  });
});
