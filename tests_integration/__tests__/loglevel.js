"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

describe("do not show logs with --loglevel silent", () => {
  runPrettier("cli/loglevel", [
    "--loglevel",
    "silent",
    "--parser",
    "--unknown-option--",
    "__not_found__.js"
  ]).test({
    status: "non-zero"
  });
});

describe("do not show warnings with --loglevel error", () => {
  runPrettier("cli/loglevel", [
    "--loglevel",
    "error",
    "--parser",
    "--unknown-option--",
    "__not_found__.js"
  ]).test({
    status: "non-zero"
  });
});

describe("show errors and warnings with --loglevel warn", () => {
  runPrettier("cli/loglevel", [
    "--loglevel",
    "warn",
    "--parser",
    "--unknown-option--",
    "__not_found__.js"
  ]).test({
    status: "non-zero"
  });
});

describe("show all logs with --loglevel debug", () => {
  runPrettier("cli/loglevel", [
    "--loglevel",
    "debug",
    "--parser",
    "--unknown-option--",
    "__not_found__.js"
  ]).test({
    status: "non-zero"
  });
});
