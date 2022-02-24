"use strict";

const runPrettier = require("../run-prettier.js");

expect.addSnapshotSerializer(require("../path-serializer.js"));

describe("skips folders in glob", () => {
  runPrettier("cli/skip-folders", ["**/*", "-l"]).test({
    status: 1,
    stderr: "",
  });
});

describe("skip folders passed specifically", () => {
  runPrettier("cli/skip-folders", [
    "a",
    "a/file.js",
    "b",
    "b/file.js",
    "-l",
  ]).test({ status: 1, stderr: "" });
});
