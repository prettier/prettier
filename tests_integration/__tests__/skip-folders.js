"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

describe("skips folders", () => {
  runPrettier("cli", ["skip-folders/**/*", "-l"]).test({
    status: 1,
    stderr: ""
  });
});
