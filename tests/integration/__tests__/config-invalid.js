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
    stderr: expect.stringMatching(/Cannot find package '--invalid--'/),
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
      /* cSpell:disable */
      outdent`
        Unexpected character, expecting string, number, datetime, boolean, inline array or inline table at row 1, col 4, pos 3:
        1> a=
              ^
        2:   b!=
      `
        .split("\n")
        .map((line) => `[error] ${line}`)
        .join("\n"),
      /* cSpell:enable */
    ),
  });
});
