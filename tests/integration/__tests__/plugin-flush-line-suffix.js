import runPrettier from "../run-prettier.js";

describe("flush all line-suffix content", () => {
  runPrettier("plugins/flushLineSuffix", ["*.foo", "--plugin=./plugin.cjs"], {
    ignoreLineEndings: true,
  }).test({
    stdout: "contents",
    stderr: "",
    status: 0,
    write: [],
  });
});
