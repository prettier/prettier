"use strict";

const runPrettier = require("../runPrettier");

describe("uses 'extensions' from languages to determine parser", () => {
  runPrettier("plugins/extensions", ["*.foo", "--plugin=./plugin"]).test({
    stdout: "!contents\n",
    stderr: "",
    status: 0,
    write: []
  });
});
