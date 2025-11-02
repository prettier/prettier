import fs from "node:fs/promises";
import outdent from "outdent";
import jestPathSerializer from "../path-serializer.js";

expect.addSnapshotSerializer(jestPathSerializer);

describe("throw error for unsupported extension", () => {
  runCli("cli/config/invalid", [
    "--config",
    "file/.prettierrc.unsupported",
  ]).test({
    status: "non-zero",
  });
});

describe("throw error with invalid config format", () => {
  runCli("cli/config/invalid", ["--config", "file/.prettierrc"]).test({
    status: "non-zero",
    stderr: expect.stringMatching(/Cannot find package '--invalid--'/u),
  });
});

describe("throw error with invalid config format", () => {
  runCli("cli/config/invalid", ["--config", "type-error/.prettierrc"]).test({
    status: "non-zero",
    stderr: expect.stringContaining(
      "Config is only allowed to be an object, but received number in",
    ),
  });
});

describe("throw error with invalid config target (directory)", () => {
  runCli("cli/config/invalid", [
    "--config",
    "folder/.prettierrc", // this is a directory
  ]).test({
    status: "non-zero",
  });
});

describe("throw error with invalid config option (int)", () => {
  runCli("cli/config/invalid", ["--config", "option/int"]).test({
    status: "non-zero",
  });
});

describe("throw error with invalid config option (trailingComma)", () => {
  runCli("cli/config/invalid", ["--config", "option/trailingComma"]).test({
    status: "non-zero",
  });
});

describe("throw error with invalid config precedence option (configPrecedence)", () => {
  runCli("cli/config/invalid", [
    "--config-precedence",
    "option/configPrecedence",
  ]).test({
    status: "non-zero",
  });
});

describe("resolves external configuration from package.json", () => {
  runCli("cli/config-external-config-syntax-error", ["syntax-error.js"]).test({
    status: 2,
  });
});

describe("throw error if both --config and --no-config are submitted", () => {
  runCli("cli/config/invalid", ["--config", ".prettierrc", "--no-config"]).test(
    {
      status: 1,
      write: [],
      stdout: "",
    },
  );
  runCli("cli/config/invalid", ["--no-config", "--config", ".prettierrc"]).test(
    {
      status: 1,
      write: [],
      stdout: "",
    },
  );
});

// Tests below require --parser to prevent an error (no parser/filepath specified)

describe("show warning with unknown option", () => {
  runCli("cli/config/invalid", [
    "--config",
    "option/unknown",
    "--parser",
    "babel",
  ]).test({
    status: 0,
  });
});

describe("show warning with kebab-case option key", () => {
  runCli("cli/config/invalid", [
    "--config",
    "option/kebab-case",
    "--parser",
    "babel",
  ]).test({
    status: 0,
  });
});

// #8815, please make sure this error contains code frame
describe("Invalid json file", () => {
  runCli("cli/config/invalid", [
    "--config",
    "broken-json/.prettierrc.json",
    "--parser",
    "babel",
  ]).test({
    status: 2,
    stdout: "",
    write: [],
    stderr: expect.stringContaining(
      outdent`
        > 1 | {a':}
            |  ^
          2 |
      `
        .split("\n")
        .map((line) => `[error] ${line}`)
        .join("\n"),
    ),
  });
});

describe("Invalid toml file", () => {
  runCli("cli/config/invalid", [
    "--config",
    "broken-toml/.prettierrc.toml",
    "--parser",
    "babel",
  ]).test({
    status: 2,
    stdout: "",
    write: [],
    stderr: expect.stringContaining(
      outdent`
        Invalid TOML document: incomplete key-value declaration: no value specified

        1:  a=
              ^
        2:    b!=
      `
        .split("\n")
        .map((line) => `[error] ${line}`)
        .join("\n"),
    ),
  });
});

describe("Invalid yaml file", () => {
  runCli("cli/config/invalid", [
    "--config",
    "broken-yaml/.prettierrc.yaml",
    "--parser",
    "babel",
  ]).test({
    status: 2,
    stdout: "",
    write: [],
    stderr: expect.stringContaining(
      // Keep the outdent, since error message changes between versions
      outdent`
        Map keys must be unique; "a" is repeated
      `
        .split("\n")
        .map((line) => `[error] ${line}`)
        .join("\n"),
    ),
  });
});

describe("Invalid config value", () => {
  runCli("cli/config/invalid", [
    "--config",
    "invalid-config-value/prettier.config.mjs",
    "--parser",
    "babel",
  ]).test({
    status: 0,
    stdout: "",
    write: [],
    stderr: "",
  });
});

// Can't put a invalid `package.json` file in the test dir
test("Invalid package.json", async () => {
  const packageJsonFile = new URL(
    "../cli/config/invalid/broken-package-json/package.json",
    import.meta.url,
  );

  try {
    await fs.writeFile(packageJsonFile, '{"prettier":{}}');
    const { stdout: configFileForValidPackageJson } = await runCli(
      "cli/config/invalid/broken-package-json",
      ["--find-config-path", "foo.js"],
    );

    expect(configFileForValidPackageJson).toBe("package.json");

    await fs.writeFile(packageJsonFile, '{"prettier":{');
    const { stdout: configFileForInvalidPackageJson } = await runCli(
      "cli/config/invalid/broken-package-json",
      ["--find-config-path", "foo.js"],
    );

    expect(configFileForInvalidPackageJson).toBe(".prettierrc");
  } finally {
    await fs.rm(packageJsonFile, { force: true });
  }
});
