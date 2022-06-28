"use strict";

const runPrettier = require("../run-prettier.js");

describe("Prettier should output the .prettierignore path", () => {
  runPrettier("cli/config/ignore", ["--find-ignore-path", "file.js"]).test({});
});

describe("Test with multiple files", () => {
  runPrettier("cli/config/no-ignore", [
    "--find-ignore-path",
    "file.js",
    "file2.js",
  ]).test({
    status: 1,
  });
});

describe("Prettier should not output a .prettierignore file", () => {
  runPrettier("cli/config/no-ignore", ["--find-ignore-path", "file.js"]).test(
    {}
  );
});
