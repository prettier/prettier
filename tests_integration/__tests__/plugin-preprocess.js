"use strict";

const runPrettier = require("../runPrettier");

describe("parser preprocess function is used to reshape input text", () => {
  runPrettier("plugins/preprocess", ["*.foo", "--plugin=./plugin"]).test({
    stdout: "preprocessed:contents\n",
    stderr: "",
    status: 0,
    write: []
  });
});
