describe("flush all line-suffix content", () => {
  runCli("plugins/flushLineSuffix", ["*.foo", "--plugin=./plugin.cjs"], {
    ignoreLineEndings: true,
  }).test({
    stdout: "contents",
    stderr: "",
    status: 0,
    write: [],
  });
});
