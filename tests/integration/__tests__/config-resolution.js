import path from "node:path";
import prettier from "prettier-local";
import createEsmUtils from "esm-utils";
import runPrettier from "../run-prettier.js";
import jestPathSerializer from "../path-serializer.js";

const { __dirname } = createEsmUtils(import.meta);

expect.addSnapshotSerializer(jestPathSerializer);

describe("resolves configuration from external files", () => {
  runPrettier("cli/config/", ["--end-of-line", "lf", "**/*.js"]).test({
    status: 0,
  });
});

describe("resolves configuration from external files and overrides by extname", () => {
  runPrettier("cli/config/", ["--end-of-line", "lf", "**/*.ts"]).test({
    status: 0,
  });
});

describe("accepts configuration from --config", () => {
  runPrettier("cli/config/", ["--config", ".prettierrc", "./js/file.js"]).test({
    status: 0,
  });
});

describe("resolves external configuration from package.json", () => {
  runPrettier("cli/config/", ["external-config/index.js"]).test({
    status: 0,
  });
});

describe("resolves configuration file with --find-config-path file", () => {
  runPrettier("cli/config/", ["--find-config-path", "no-config/file.js"]).test({
    status: 0,
  });
});

describe("resolves json configuration file with --find-config-path file", () => {
  runPrettier("cli/config/", ["--find-config-path", "rc-json/file.js"]).test({
    status: 0,
  });
});

describe("resolves yaml configuration file with --find-config-path file", () => {
  runPrettier("cli/config/", ["--find-config-path", "rc-yaml/file.js"]).test({
    status: 0,
  });
});

describe("resolves toml configuration file with --find-config-path file", () => {
  runPrettier("cli/config/", ["--find-config-path", "rc-toml/file.js"]).test({
    status: 0,
  });
});

describe("prints error message when no file found with --find-config-path", () => {
  runPrettier("cli/config/", [
    "--end-of-line",
    "lf",
    "--find-config-path",
    "..",
  ]).test({
    stdout: "",
    status: 1,
  });
});

describe("CLI overrides take precedence", () => {
  runPrettier("cli/config/", [
    "--end-of-line",
    "lf",
    "--print-width",
    "1",
    "**/*.js",
  ]).test({
    status: 0,
  });
});

test("API resolveConfig with no args", async () => {
  await expect(prettier.resolveConfig()).resolves.toEqual({});
});

test("API resolveConfig with file arg", async () => {
  const file = path.resolve(path.join(__dirname, "../cli/config/js/file.js"));
  await expect(prettier.resolveConfig(file)).resolves.toMatchObject({
    tabWidth: 8,
  });
});

test("API resolveConfig with file arg and extension override", async () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/no-config/file.ts")
  );
  await expect(prettier.resolveConfig(file)).resolves.toMatchObject({
    semi: true,
  });
});

test("API resolveConfig with file arg and .editorconfig", async () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/file.js")
  );

  await expect(prettier.resolveConfig(file)).resolves.toMatchObject({
    semi: false,
  });

  await expect(
    prettier.resolveConfig(file, { editorconfig: true })
  ).resolves.toMatchObject({
    useTabs: true,
    tabWidth: 8,
    printWidth: 100,
  });
});

test("API resolveConfig with file arg and .editorconfig (key = unset)", async () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/tab_width=unset.js")
  );

  await expect(
    prettier.resolveConfig(file, { editorconfig: true })
  ).resolves.not.toMatchObject({ tabWidth: "unset" });
});

test("API resolveConfig with nested file arg and .editorconfig", async () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/lib/file.js")
  );

  await expect(prettier.resolveConfig(file)).resolves.toMatchObject({
    semi: false,
  });

  await expect(
    prettier.resolveConfig(file, { editorconfig: true })
  ).resolves.toMatchObject({
    useTabs: false,
    tabWidth: 2,
    printWidth: 100,
  });
});

test("API resolveConfig with nested file arg and .editorconfig and indent_size = tab", async () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/lib/indent_size=tab.js")
  );

  await expect(prettier.resolveConfig(file)).resolves.toMatchObject({
    semi: false,
  });

  await expect(
    prettier.resolveConfig(file, { editorconfig: true })
  ).resolves.toMatchObject({
    useTabs: false,
    tabWidth: 8,
    printWidth: 100,
  });
});

test("API clearConfigCache", () => {
  expect(() => prettier.clearConfigCache()).not.toThrowError();
});

test("API resolveConfig overrides work with dotfiles", async () => {
  const folder = path.join(__dirname, "../cli/config/dot-overrides");
  await expect(
    prettier.resolveConfig(path.join(folder, ".foo.json"))
  ).resolves.toMatchObject({
    tabWidth: 4,
  });
});

test("API resolveConfig overrides work with absolute paths", async () => {
  // Absolute path
  const file = path.join(__dirname, "../cli/config/filepath/subfolder/file.js");
  await expect(prettier.resolveConfig(file)).resolves.toMatchObject({
    tabWidth: 6,
  });
});

test("API resolveConfig overrides excludeFiles", async () => {
  const notOverride = path.join(
    __dirname,
    "../cli/config/overrides-exclude-files/foo"
  );
  await expect(prettier.resolveConfig(notOverride)).resolves.toMatchObject({
    singleQuote: true,
    trailingComma: "all",
  });

  const singleQuote = path.join(
    __dirname,
    "../cli/config/overrides-exclude-files/single-quote.js"
  );
  await expect(prettier.resolveConfig(singleQuote)).resolves.toMatchObject({
    singleQuote: true,
    trailingComma: "es5",
  });

  const doubleQuote = path.join(
    __dirname,
    "../cli/config/overrides-exclude-files/double-quote.js"
  );
  await expect(prettier.resolveConfig(doubleQuote)).resolves.toMatchObject({
    singleQuote: false,
    trailingComma: "es5",
  });
});

test("API resolveConfig removes $schema option", async () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/$schema/index.js")
  );
  await expect(prettier.resolveConfig(file)).resolves.toEqual({
    tabWidth: 42,
  });
});

test("API resolveConfig resolves relative path values based on config filepath", async () => {
  const currentDir = path.join(__dirname, "../cli/config/resolve-relative");
  const parentDir = path.resolve(currentDir, "..");
  await expect(
    prettier.resolveConfig(`${currentDir}/index.js`)
  ).resolves.toMatchObject({
    plugins: [path.join(parentDir, "path-to-plugin")],
    pluginSearchDirs: [path.join(parentDir, "path-to-plugin-search-dir")],
  });

  await expect(
    prettier.resolveConfig(
      path.join(__dirname, "../cli/config/plugin-search-dirs/index.js")
    )
  ).resolves.toMatchObject({
    pluginSearchDirs: false,
  });
});

test("API resolveConfig de-references to an external module", async () => {
  const currentDir = path.join(__dirname, "../cli/config/external-config");
  await expect(
    prettier.resolveConfig(`${currentDir}/index.js`)
  ).resolves.toEqual({
    printWidth: 77,
    semi: false,
  });
});

test(".cjs config file", async () => {
  const parentDirectory = path.join(__dirname, "../cli/config/rc-cjs");

  const config = {
    trailingComma: "all",
    singleQuote: true,
  };

  for (const directoryName of [
    "prettierrc-cjs-in-type-module",
    "prettierrc-cjs-in-type-commonjs",
    "prettierrc-cjs-in-type-none",
    "prettier-config-cjs-in-type-commonjs",
    "prettier-config-cjs-in-type-none",
    "prettier-config-cjs-in-type-module",
  ]) {
    const file = path.join(parentDirectory, directoryName, "foo.js");

    await expect(prettier.resolveConfig(file)).resolves.toMatchObject(config);
  }
});

test(".json5 config file", async () => {
  const parentDirectory = path.join(__dirname, "../cli/config/rc-json5");
  const config = {
    trailingComma: "all",
    printWidth: 81,
    tabWidth: 3,
  };
  const file = path.join(parentDirectory, "json5/foo.js");

  await expect(prettier.resolveConfig(file)).resolves.toMatchObject(config);
});

test(".json5 config file(invalid)", async () => {
  const parentDirectory = path.join(__dirname, "../cli/config/rc-json5");
  const file = path.join(parentDirectory, "invalid/foo.js");
  const error = /JSON5: invalid end of input at 2:1/;

  await expect(prettier.resolveConfig(file)).rejects.toThrow(error);
});
