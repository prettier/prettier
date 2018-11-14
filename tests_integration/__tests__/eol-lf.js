"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

describe("Has correct default Unix line endings", () => {
  runPrettier("cli/config/", ["**/*.js"]).test({
    status: 0
  });
});
