"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

describe("ignores node_modules by default", () => {
  runPrettier("cli/patterns", [".", "-l"]).test({
    status: 1
  });
});

describe("doesn't ignore node_modules with --with-node-modules flag", () => {
  runPrettier("cli/patterns", [".", "-l", "--with-node-modules"]).test({
    status: 1
  });
});

describe("should expand directories", () => {
  runPrettier("cli/patterns", ["expand-dir", "-l"]).test({
    status: 1
  });
});
