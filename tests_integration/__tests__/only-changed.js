"use strict";

const runPrettier = require("../runPrettier");

describe("write cache with --write --only-changed + formatted file", () => {
  runPrettier("cli/only-changed", [
    "--write",
    "--only-changed",
    "formatted.js"
  ]).test({
    write: [{ filename: ".prettiercache" }],
    status: 0
  });
});

describe("write cache with --write --only-changed + unformatted file", () => {
  runPrettier("cli/only-changed", [
    "--write",
    "--only-changed",
    "unformatted.js"
  ]).test({
    write: [{ filename: "unformatted.js" }, { filename: ".prettiercache" }],
    status: 0
  });
});

describe("write cache with --write --only-changed + formatted file + custom location", () => {
  process.env.PRETTIER_CACHE_LOCATION = ".custom";

  runPrettier("cli/only-changed", [
    "--write",
    "--only-changed",
    "formatted.js"
  ]).test({
    write: [{ filename: ".custom" }],
    status: 0
  });

  process.env.PRETTIER_CACHE_LOCATION = undefined;
});
