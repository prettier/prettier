describe("parser preprocess function is used to reshape input text", () => {
  runCli("plugins/preprocess", ["*.foo", "--plugin=./plugin.cjs"], {
    ignoreLineEndings: true,
  }).test({
    stdout: "preprocessed:contents",
    stderr: "",
    status: 0,
    write: [],
  });
  runCli(
    "plugins/preprocess",
    ["*.foo", "--plugin=./plugin-with-async-preprocess.cjs"],
    {
      ignoreLineEndings: true,
    },
  ).test({
    stdout: "preprocessed:async:contents",
    stderr: "",
    status: 0,
    write: [],
  });
});
