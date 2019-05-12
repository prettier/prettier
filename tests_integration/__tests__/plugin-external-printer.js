"use strict";

const runPrettier = require("../runPrettier");

describe("plugin printer should override internal ones", () => {
  runPrettier("plugins/plugin-external-precedence", [
    "package.json",
    "--plugin=./printer"
  ]).test({
    stdout: "Overridden",
    stderr: "",
    status: 0,
    write: []
  });
});
