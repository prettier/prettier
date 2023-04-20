import path from "node:path";
import fs from "node:fs";
import createEsmUtils from "esm-utils";
const { __dirname } = createEsmUtils(import.meta);

fs.writeFileSync(
  // This file is in `.gitignore`, just copy from `regular-module.js`
  path.join(__dirname, "../cli/ignore-path/other-regular-modules.js"),
  fs.readFileSync(path.join(__dirname, "../cli/ignore-path/regular-module.js"))
);

describe("ignore path", () => {
  runCli("cli/ignore-path", [
    "**/*.js",
    "--ignore-path",
    ".gitignore",
    "-l",
  ]).test({
    status: 1,
    stderr: "",
    write: [],
  });
});

describe("support .prettierignore", () => {
  runCli("cli/ignore-path", ["**/*.js", "-l"]).test({
    status: 1,
    stderr: "",
    write: [],
  });
});

describe("ignore file when using --debug-check", () => {
  runCli("cli/ignore-path", ["**/*.js", "--debug-check"]).test({
    status: 0,
    stderr: "",
    write: [],
  });
});

describe("outputs files as-is if no --write", () => {
  runCli("cli/ignore-path", ["regular-module.js"], {
    ignoreLineEndings: true,
  }).test({
    status: 0,
    stderr: "",
    write: [],
  });
});

describe("multiple `--ignore-path`", () => {
  runCli("cli/ignore-path", [
    "**/*.js",
    "--debug-check",
    "--ignore-path",
    ".gitignore",
    "--ignore-path",
    ".prettierignore",
    "--ignore-path",
    ".non-exists-ignore-file",
  ]).test({
    status: 0,
    stdout: "",
    stderr: "",
    write: [],
  });
});
