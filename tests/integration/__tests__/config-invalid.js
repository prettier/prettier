import fs from "node:fs/promises";
import jestPathSerializer from "../path-serializer.js";

expect.addSnapshotSerializer(jestPathSerializer);

describe("throw error with invalid config target (directory)", () => {
  runCli("cli/config/invalid", [
    "--config",
    "folder/.prettierrc", // this is a directory
  ]).test({
    status: "non-zero",
    stderr:
      /*
      On Node.js<26

      ```
      EISDIR: illegal operation on a directory, read
      ```

      On Node.js>=26
      ```
      EISDIR: illegal operation on a directory, read '<cli>/config/invalid/folder/.prettierrc'
      ```
      */
      expect.stringContaining("EISDIR: illegal operation on a directory, read"),
    stdout: "",
    write: [],
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
