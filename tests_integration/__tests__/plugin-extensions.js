"use strict";

const runPrettier = require("../runPrettier");
const EOL = "\n";

describe("uses 'extensions' from languages to determine parser", () => {
  runPrettier("plugins/extensions", ["*.foo", "--plugin=./plugin"]).test({
    stdout: "!contents" + EOL,
    stderr: "",
    status: 0,
    write: []
  });
});
