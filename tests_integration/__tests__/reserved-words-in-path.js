"use strict";

const runPrettier = require("../runPrettier");
expect.addSnapshotSerializer(require("../path-serializer"));

describe("don't skip file paths containing reserved words like `constructor`", () => {
  runPrettier("cli/reserved-words-in-path", [
    "./constructor/should-be-formatted.js",
    "-l",
  ]).test({ status: 1 });
});
