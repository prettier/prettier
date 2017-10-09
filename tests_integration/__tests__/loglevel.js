"use strict";

const runPrettier = require("../runPrettier");

const threshold = 20;

expect.addSnapshotSerializer({
  test: value =>
    typeof value === "string" &&
    value.split("\n").some(line => line.length > threshold),
  print: (value, serializer) =>
    serializer(
      value
        .split("\n")
        .map(
          line =>
            line.length > threshold
              ? line.slice(0, threshold - 3) + "..."
              : line
        )
        .join("\n")
    )
});

describe("do not show logs with --loglevel silent", () => {
  runPrettier("cli/loglevel", [
    "--loglevel",
    "silent",
    "--unknown-option",
    "--parser",
    "unknown-parser",
    "not-found.js"
  ]).test({
    status: "non-zero"
  });
});

describe("do not show warnings with --loglevel error", () => {
  runPrettier("cli/loglevel", [
    "--loglevel",
    "error",
    "--unknown-option",
    "--parser",
    "unknown-parser",
    "not-found.js"
  ]).test({
    status: "non-zero"
  });
});

describe("show errors and warnings with --loglevel warn", () => {
  runPrettier("cli/loglevel", [
    "--loglevel",
    "warn",
    "--unknown-option",
    "--parser",
    "unknown-parser",
    "not-found.js"
  ]).test({
    status: "non-zero"
  });
});

describe("show all logs with --loglevel debug", () => {
  runPrettier("cli/loglevel", [
    "--loglevel",
    "debug",
    "--unknown-option",
    "--parser",
    "unknown-parser",
    "not-found.js"
  ]).test({
    status: "non-zero"
  });
});
