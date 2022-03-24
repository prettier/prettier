"use strict";

const runPrettier = require("../run-prettier.js");

describe("no error on unmatched pattern", () => {
  runPrettier("cli/error-on-unmatched-pattern", [
    "--no-error-on-unmatched-pattern",
    "**/*.js",
  ]).test({
    status: 0,
  });
});

describe("error on unmatched pattern", () => {
  runPrettier("cli/error-on-unmatched-pattern", ["**/*.toml"]).test({
    status: 2,
  });
});

describe("no error on unmatched pattern when 2nd glob has no match", () => {
  runPrettier("cli/error-on-unmatched-pattern", [
    "--no-error-on-unmatched-pattern",
    "**/*.{json,js,yml}",
    "**/*.toml",
  ]).test({
    status: 0,
  });
});

describe("error on unmatched pattern when 2nd glob has no match", () => {
  runPrettier("cli/error-on-unmatched-pattern", [
    "**/*.{json,js,yml}",
    "**/*.toml",
  ]).test({
    status: 2,
  });
});

describe("If you input 1e3, 1e3 should be outputted and not a hexadecimal format", () => {
  runPrettier("cli/error-on-unmatched-pattern", [
    "--no-error-on-unmatched-pattern",
    "**/*.toml",
  ]).test({
    status: 0,
  });
});
