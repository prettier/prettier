import path from "node:path";
import fs from "node:fs";
import createEsmUtils from "esm-utils";
import runPrettier from "../run-prettier.js";

const { __dirname } = createEsmUtils(import.meta);

fs.writeFileSync(
  // This file is in `.gitignore`, just copy from `regular-module.js`
  path.join(__dirname, "../cli/ignore-path/other-regular-modules.js"),
  fs.readFileSync(path.join(__dirname, "../cli/ignore-path/regular-module.js"))
);

describe("ignore path", () => {
  runPrettier("cli/ignore-path", [
    "**/*.js",
    "--ignore-path",
    ".gitignore",
    "-l",
  ]).test({
    status: 1,
  });
});

describe("support .prettierignore", () => {
  runPrettier("cli/ignore-path", ["**/*.js", "-l"]).test({
    status: 1,
  });
});

describe("ignore file when using --debug-check", () => {
  runPrettier("cli/ignore-path", ["**/*.js", "--debug-check"]).test({
    status: 0,
  });
});

describe("outputs files as-is if no --write", () => {
  runPrettier("cli/ignore-path", ["regular-module.js"], {
    ignoreLineEndings: true,
  }).test({
    status: 0,
  });
});
