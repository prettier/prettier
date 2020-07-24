"use strict";

const runPrettier = require("../runPrettier");

describe("ignore-unknown dir", () => {
  runPrettier("cli/ignore-unknown", [
    ".",
    "--ignore-unknown",
    "--list-different",
  ]).test({
    status: "non-zero",
    stderr: "",
    write: [],
  });
});

describe("ignore-unknown pattern", () => {
  runPrettier("cli/ignore-unknown", [
    "*",
    "--ignore-unknown",
    "--list-different",
  ]).test({
    status: "non-zero",
    stderr: "",
    write: [],
  });
});

describe("ignore-unknown write", () => {
  runPrettier("cli/ignore-unknown", [
    ".",
    "--ignore-unknown",
    "--write",
    "--list-different",
  ]).test({
    status: 0,
    stderr: "",
  });
});

describe("ignore-unknown check", () => {
  runPrettier("cli/ignore-unknown", [".", "--ignore-unknown", "--check"]).test({
    status: 1,
  });
});
