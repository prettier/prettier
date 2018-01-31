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

test("API resolveConfigWithFilePath with no args", () => {
  return prettier.resolveConfigWithFilePath().then(result => {
    expect(result).toBeNull();
  });
});

test("API resolveConfigWithFilePath.sync with no args", () => {
  expect(prettier.resolveConfigWithFilePath.sync()).toBeNull();
});

test("API resolveConfigWithFilePath with file arg", () => {
  const file = path.resolve(path.join(__dirname, "../cli/config/js/file.js"));
  const config = path.resolve(
    path.join(__dirname, "../cli/config/js/prettier.config.js")
  );
  return prettier.resolveConfigWithFilePath(file).then(result => {
    expect(result.config).toMatchObject({
      tabWidth: 8
    });
    expect(result.filePath).toMatch(config);
  });
});

test("API resolveConfigWithFilePath.sync with file arg", () => {
  const file = path.resolve(path.join(__dirname, "../cli/config/js/file.js"));
  const config = path.resolve(
    path.join(__dirname, "../cli/config/js/prettier.config.js")
  );
  const result = prettier.resolveConfigWithFilePath.sync(file);
  expect(result.config).toMatchObject({
    tabWidth: 8
  });
  expect(result.filePath).toMatch(config);
});

test("API resolveConfigWithFilePath with file arg and extension override", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/no-config/file.ts")
  );
  const config = path.resolve(
    path.join(__dirname, "../cli/config/.prettierrc")
  );
  return prettier.resolveConfigWithFilePath(file).then(result => {
    expect(result.config).toMatchObject({
      semi: true
    });
    expect(result.filePath).toMatch(config);
  });
});

test("API resolveConfigWithFilePath.sync with file arg and extension override", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/no-config/file.ts")
  );
  const config = path.resolve(
    path.join(__dirname, "../cli/config/.prettierrc")
  );
  const result = prettier.resolveConfigWithFilePath.sync(file);
  expect(result.config).toMatchObject({
    semi: true
  });
  expect(result.filePath).toMatch(config);
});

test("API resolveConfigWithFilePath with file arg and .editorconfig", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/file.js")
  );
  const config = path.resolve(
    path.join(__dirname, "../cli/config/.prettierrc")
  );

  return prettier
    .resolveConfigWithFilePath(file, { editorconfig: true })
    .then(result => {
      expect(result.config).toMatchObject({
        useTabs: true,
        tabWidth: 8,
        printWidth: 100
      });
      expect(result.filePath).toMatch(config);
    });
});

test("API resolveConfigWithFilePath.sync with file arg and .editorconfig", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/file.js")
  );
  const config = path.resolve(
    path.join(__dirname, "../cli/config/.prettierrc")
  );

  const result = prettier.resolveConfigWithFilePath.sync(file);
  expect(result.config).toMatchObject({
    semi: false
  });
  expect(result.filePath).toMatch(config);

  const resultWithEditorConfig = prettier.resolveConfigWithFilePath.sync(file, {
    editorconfig: true
  });
  expect(resultWithEditorConfig.config).toMatchObject({
    useTabs: true,
    tabWidth: 8,
    printWidth: 100
  });
  expect(resultWithEditorConfig.filePath).toMatch(config);
});

test("API resolveConfigWithFilePath with nested file arg and .editorconfig", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/lib/file.js")
  );
  const config = path.resolve(
    path.join(__dirname, "../cli/config/.prettierrc")
  );
  return prettier
    .resolveConfigWithFilePath(file, { editorconfig: true })
    .then(result => {
      expect(result.config).toMatchObject({
        useTabs: false,
        tabWidth: 2,
        printWidth: 100
      });
      expect(result.filePath).toMatch(config);
    });
});

test("API resolveConfigWithFilePath.sync with nested file arg and .editorconfig", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/lib/file.js")
  );
  const config = path.resolve(
    path.join(__dirname, "../cli/config/.prettierrc")
  );

  const result = prettier.resolveConfigWithFilePath.sync(file);
  expect(result.config).toMatchObject({
    semi: false
  });
  expect(result.filePath).toMatch(config);

  const resultWithEditorConfig = prettier.resolveConfigWithFilePath.sync(file, {
    editorconfig: true
  });
  expect(resultWithEditorConfig.config).toMatchObject({
    useTabs: false,
    tabWidth: 2,
    printWidth: 100
  });
  expect(resultWithEditorConfig.filePath).toMatch(config);
});

test("API resolveConfigWithFilePath with nested file arg and .editorconfig and indent_size = tab", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/lib/indent_size=tab.js")
  );
  const config = path.resolve(
    path.join(__dirname, "../cli/config/.prettierrc")
  );
  return prettier
    .resolveConfigWithFilePath(file, { editorconfig: true })
    .then(result => {
      expect(result.config).toMatchObject({
        useTabs: false,
        tabWidth: 8,
        printWidth: 100
      });
      expect(result.filePath).toMatch(config);
    });
});

test("API resolveConfigWithFilePath.sync with nested file arg and .editorconfig and indent_size = tab", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/lib/indent_size=tab.js")
  );
  const config = path.resolve(
    path.join(__dirname, "../cli/config/.prettierrc")
  );

  const result = prettier.resolveConfigWithFilePath.sync(file);
  expect(result.config).toMatchObject({
    semi: false
  });
  expect(result.filePath).toMatch(config);

  const resultWithEditorConfig = prettier.resolveConfigWithFilePath.sync(file, {
    editorconfig: true
  });
  expect(resultWithEditorConfig.config).toMatchObject({
    useTabs: false,
    tabWidth: 8,
    printWidth: 100
  });
  expect(result.filePath).toMatch(config);
});

test("API resolveConfigWithFilePath.sync overrides work with absolute paths", () => {
  // Absolute path
  const file = path.join(__dirname, "../cli/config/filepath/subfolder/file.js");
  const config = path.join(__dirname, "../cli/config/filepath/.prettierrc");
  const result = prettier.resolveConfigWithFilePath.sync(file);
  expect(result.config).toMatchObject({
    tabWidth: 6
  });
  expect(result.filePath).toMatch(config);
});

test("API resolveConfigWithFilePath removes $schema option", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/$schema/index.js")
  );
  const config = path.join(__dirname, "../cli/config/$schema/.prettierrc");
  return prettier.resolveConfigWithFilePath(file).then(result => {
    expect(result.config).toEqual({
      tabWidth: 42
    });
    expect(result.filePath).toMatch(config);
  });
});

test("API resolveConfigWithFilePath.sync removes $schema option", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/$schema/index.js")
  );
  const config = path.join(__dirname, "../cli/config/$schema/.prettierrc");
  const result = prettier.resolveConfigWithFilePath.sync(file);
  expect(result.config).toEqual({
    tabWidth: 42
  });
  expect(result.filePath).toMatch(config);
});

test("API clearConfigCache", () => {
  expect(() => prettier.clearConfigCache()).not.toThrowError();
});
