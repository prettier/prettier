"use strict";

const runPrettier = require("../runPrettier");

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
