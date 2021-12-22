"use strict";

const runPrettier = require("../runPrettier.js");

expect.addSnapshotSerializer(require("../path-serializer.js"));

describe("support relative paths", () => {
  runPrettier("cli/ignore-relative-path", [
    "./shouldNotBeIgnored.js",
    "./level1/level2/level3/shouldNotBeFormat.js",
    "level1-glob/level2-glob/level3-glob/shouldNotBeFormat.js",
    "./level1-glob/level2-glob/level3-glob/shouldNotBeIgnored.scss",
    "level1-glob/shouldNotBeIgnored.js",
    "-l",
  ]).test({
    status: 1,
  });
});
