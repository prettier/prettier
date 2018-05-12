"use strict";

const runPrettier = require("../runPrettier");

describe("checks stdin with --list-different", () => {
  runPrettier("cli/with-shebang", ["--list-different"], {
    input: "0"
  }).test({
    stdout: "(stdin)\n",
    stderr: "",
    status: "non-zero"
  });
});

describe("--list-different lists different file and exits with code 1", () => {
  runPrettier("cli/write", ["--list-different", "unformatted.js"]).test({
    stdout: "unformatted.js\n",
    status: 1
  });
});

describe("--list-different doest not list formatted file and exits with code 0", () => {
  runPrettier("cli/write", ["--list-different", "formatted.js"]).test({
    stdout: "",
    status: 0
  });
});

describe("--list-different exits with 1 if at least 1 file is not formatted", () => {
  runPrettier("cli/write", [
    "--list-different",
    "formatted.js",
    "unformatted.js"
  ]).test({
    stdout: "unformatted.js\n",
    status: 1
  });
});

describe("--list-different only formats file once", () => {
  runPrettier("cli/write", ["--list-different", "unformatted.js"]).test({
    formatCalls: 1
  });
});
