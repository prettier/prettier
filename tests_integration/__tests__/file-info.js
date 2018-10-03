"use strict";

const path = require("path");

const runPrettier = require("../runPrettier");
const prettier = require("prettier/local");

expect.addSnapshotSerializer(require("../path-serializer"));

describe("extracts file-info for a js file", () => {
  runPrettier("cli/", ["--file-info", "something.js"]).test({
    status: 0
  });
});

describe("extracts file-info for a markdown file", () => {
  runPrettier("cli/", ["--file-info", "README.md"]).test({
    status: 0
  });
});

describe("extracts file-info for a known markdown file with no extension", () => {
  runPrettier("cli/", ["--file-info", "README"]).test({
    status: 0
  });
});

describe("extracts file-info with ignored=true for a file in .prettierignore", () => {
  runPrettier("cli/ignore-path/", ["--file-info", "regular-module.js"]).test({
    status: 0
  });
});

describe("extracts file-info with ignored=true for a file in a hand-picked .prettierignore", () => {
  runPrettier("cli/", [
    "--file-info",
    "regular-module.js",
    "--ignore-path=ignore-path/.prettierignore"
  ]).test({
    status: 0
  });
});

describe("extracts file-info for a file in not_node_modules", () => {
  runPrettier("cli/with-node-modules/", [
    "--file-info",
    "not_node_modules/file.js"
  ]).test({
    status: 0
  });
});

describe("extracts file-info with with ignored=true for a file in node_modules", () => {
  runPrettier("cli/with-node-modules/", [
    "--file-info",
    "node_modules/file.js"
  ]).test({
    status: 0
  });
});

describe("extracts file-info with ignored=false for a file in node_modules when --with-node-modules provided", () => {
  runPrettier("cli/with-node-modules/", [
    "--file-info",
    "node_modules/file.js",
    "--with-node-modules"
  ]).test({
    status: 0
  });
});

describe("extracts file-info with inferredParser=null for file.foo", () => {
  runPrettier("cli/", ["--file-info", "file.foo"]).test({
    status: 0
  });
});

describe("extracts file-info with inferredParser=foo when plugins are autoloaded", () => {
  runPrettier("plugins/automatic/", ["--file-info", "file.foo"]).test({
    status: 0
  });
});

describe("extracts file-info with inferredParser=foo when plugins are loaded with --plugin-search-dir", () => {
  runPrettier("cli/", [
    "--file-info",
    "file.foo",
    "--plugin-search-dir",
    "../plugins/automatic"
  ]).test({
    status: 0
  });
});

describe("extracts file-info with inferredParser=foo when a plugin is hand-picked", () => {
  runPrettier("cli/", [
    "--file-info",
    "file.foo",
    "--plugin",
    "../plugins/automatic/node_modules/@prettier/plugin-foo"
  ]).test({
    status: 0
  });
});

test("API getFileInfo with no args", () => {
  // TODO: change this to `rejects.toThrow()` when we upgrade to Jest >= 22
  // https://github.com/facebook/jest/issues/3601
  expect.assertions(1);
  return prettier.getFileInfo().catch(err => {
    expect(err).toBeDefined();
  });
});

test("API getFileInfo.sync with no args", () => {
  expect(() => prettier.getFileInfo.sync()).toThrow();
});

test("API getFileInfo with filepath only", () => {
  expect(prettier.getFileInfo("README")).resolves.toMatchObject({
    ignored: false,
    inferredParser: "markdown"
  });
});

test("API getFileInfo.sync with filepath only", () => {
  expect(prettier.getFileInfo.sync("README")).toMatchObject({
    ignored: false,
    inferredParser: "markdown"
  });
});

test("API getFileInfo with ignorePath", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/ignore-path/regular-module.js")
  );
  const ignorePath = path.resolve(
    path.join(__dirname, "../cli/ignore-path/.prettierignore")
  );

  expect(prettier.getFileInfo(file)).resolves.toMatchObject({
    ignored: false,
    inferredParser: "babylon"
  });

  expect(
    prettier.getFileInfo(file, {
      ignorePath
    })
  ).resolves.toMatchObject({
    ignored: true,
    inferredParser: "babylon"
  });
});

test("API getFileInfo.sync with ignorePath", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/ignore-path/regular-module.js")
  );
  const ignorePath = path.resolve(
    path.join(__dirname, "../cli/ignore-path/.prettierignore")
  );

  expect(prettier.getFileInfo.sync(file)).toMatchObject({
    ignored: false,
    inferredParser: "babylon"
  });

  expect(
    prettier.getFileInfo.sync(file, {
      ignorePath
    })
  ).toMatchObject({
    ignored: true,
    inferredParser: "babylon"
  });
});

test("API getFileInfo with withNodeModules", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/with-node-modules/node_modules/file.js")
  );
  expect(prettier.getFileInfo(file)).resolves.toMatchObject({
    ignored: true,
    inferredParser: "babylon"
  });
  expect(
    prettier.getFileInfo(file, {
      withNodeModules: true
    })
  ).resolves.toMatchObject({
    ignored: false,
    inferredParser: "babylon"
  });
});

describe("extracts file-info for a JS file with no extension but a standard shebang", () => {
  expect(
    prettier.getFileInfo.sync("tests_integration/cli/shebang/node-shebang")
  ).toMatchObject({
    ignored: false,
    inferredParser: "babylon"
  });
});

describe("extracts file-info for a JS file with no extension but an env-based shebang", () => {
  expect(
    prettier.getFileInfo.sync("tests_integration/cli/shebang/env-node-shebang")
  ).toMatchObject({
    ignored: false,
    inferredParser: "babylon"
  });
});

describe("returns null parser for unknown shebang", () => {
  expect(
    prettier.getFileInfo.sync("tests_integration/cli/shebang/nonsense-shebang")
  ).toMatchObject({
    ignored: false,
    inferredParser: null
  });
});

test("API getFileInfo with plugins loaded using pluginSearchDir", () => {
  const file = "file.foo";
  const pluginsPath = path.resolve(
    path.join(__dirname, "../plugins/automatic")
  );
  expect(prettier.getFileInfo(file)).resolves.toMatchObject({
    ignored: false,
    inferredParser: null
  });
  expect(
    prettier.getFileInfo(file, {
      pluginSearchDirs: [pluginsPath]
    })
  ).resolves.toMatchObject({
    ignored: false,
    inferredParser: "foo"
  });
});

test("API getFileInfo with hand-picked plugins", () => {
  const file = "file.foo";
  const pluginPath = path.resolve(
    path.join(
      __dirname,
      "../plugins/automatic/node_modules/@prettier/plugin-foo"
    )
  );
  expect(prettier.getFileInfo(file)).resolves.toMatchObject({
    ignored: false,
    inferredParser: null
  });
  expect(
    prettier.getFileInfo(file, {
      plugins: [pluginPath]
    })
  ).resolves.toMatchObject({
    ignored: false,
    inferredParser: "foo"
  });
});
