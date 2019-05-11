"use strict";

const runPrettier = require("../runPrettier");

describe("parser preprocess function is used to reshape input text", () => {
  runPrettier("plugins/plugin-external-precedence", [
    "package.json",
    "--plugin=./plugin"
  ]).test({
    stdout: "Overridden",
    stderr: "",
    status: 0,
    write: []
  });
});
