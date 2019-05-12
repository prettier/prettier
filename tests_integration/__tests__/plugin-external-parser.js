"use strict";

const runPrettier = require("../runPrettier");

describe("plugin parser should override internal ones", () => {
  runPrettier("plugins/plugin-external-precedence", [
    "package.json",
    "--plugin=./parser"
  ]).test({
    stdout: '"Custom parsed"',
    stderr: "",
    status: 0,
    write: []
  });
});
