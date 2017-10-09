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
  runPrettierWithLogLevel("silent");
});

describe("do not show warnings with --loglevel error", () => {
  runPrettierWithLogLevel("error");
});

describe("show errors and warnings with --loglevel warn", () => {
  runPrettierWithLogLevel("warn");
});

describe("show all logs with --loglevel debug", () => {
  runPrettierWithLogLevel("debug");
});

function runPrettierWithLogLevel(logLevel) {
  runPrettier("cli/loglevel", [
    "--loglevel",
    logLevel,
    "--unknown-option",
    "--parser",
    "unknown-parser",
    "not-found.js"
  ]).test({
    status: "non-zero"
  });
}
