"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

describe("ignores file name contains emoji", () => {
  runPrettier("cli/ignore-emoji", ["**/*.js", "-l"]).test({
    status: 1,
  });
});
