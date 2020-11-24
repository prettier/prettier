"use strict";

const runPrettier = require("../runPrettier");

describe("flush all line-suffix content", () => {
  runPrettier("plugins/flushLineSuffix", ["*.foo", "--plugin=./plugin"], {
    ignoreLineEndings: true,
  }).test({
    stdout: "contents",
    stderr: "",
    status: 0,
    write: [],
  });
});
