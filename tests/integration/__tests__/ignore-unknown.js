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

describe("ignore-unknown alias", () => {
  runPrettier("cli/ignore-unknown", [".", "-u", "--list-different"]).test({
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

describe("None exist file", () => {
  runPrettier("cli/ignore-unknown", [
    "non-exist-file",
    "--ignore-unknown",
  ]).test({
    status: 2,
  });
});

describe("Not matching pattern", () => {
  runPrettier("cli/ignore-unknown", [
    "*.non-exist-pattern",
    "--ignore-unknown",
  ]).test({
    status: 2,
  });
});

describe("Ignored file", () => {
  runPrettier("cli/ignore-unknown", ["ignored.js", "--ignore-unknown"]).test({
    status: 0,
  });
});
