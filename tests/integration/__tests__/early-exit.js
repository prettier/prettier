import prettier from "../../config/prettier-entry.js";

describe("show version with --version", () => {
  runCli("cli/with-shebang", ["--version"]).test({
    stdout: prettier.version,
    status: 0,
  });
});

describe("show usage with --help", () => {
  runCli("cli", ["--help"]).test({
    status: 0,
  });
});

describe("show detailed usage with --help l (alias)", () => {
  runCli("cli", ["--help", "l"]).test({
    status: 0,
  });
});

describe("show detailed usage with plugin options (manual resolution)", () => {
  runCli("cli", [
    "--help",
    "tab-width",
    "--plugin=../plugins/automatic/node_modules/prettier-plugin-bar/index.js",
    "--parser=bar",
  ]).test({
    status: 0,
  });
});

describe("throw error with --help not-found", () => {
  runCli("cli", ["--help", "not-found"]).test({
    status: 1,
  });
});

describe("show warning with --help not-found (typo)", () => {
  runCli("cli", [
    "--help",
    // cspell:disable-next-line
    "parserr",
  ]).test({
    status: 0,
  });
});

describe("throw error with --check + --list-different", () => {
  runCli("cli", ["--check", "--list-different"]).test({
    status: 1,
  });
});

describe("throw error with --write + --debug-check", () => {
  runCli("cli", ["--write", "--debug-check"]).test({
    status: 1,
  });
});

describe("throw error with --find-config-path + multiple files", () => {
  runCli("cli", ["--find-config-path", "abc.js", "def.js"]).test({
    status: 1,
  });
});

describe("throw error with --file-info + multiple files", () => {
  runCli("cli", ["--file-info", "abc.js", "def.js"]).test({
    status: 1,
  });
});

describe("throw error and show usage with something unexpected", () => {
  runCli("cli", [], { isTTY: true }).test({
    status: "non-zero",
  });
});
