"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

describe("should support dot pattern", () => {
  runPrettier("cli/patterns", [".", "-l"]).test({
    status: 1
  });
});

describe("should expand directories", () => {
  runPrettier("cli/patterns", ["subdir", "-l"]).test({
    status: 1
  });
});
