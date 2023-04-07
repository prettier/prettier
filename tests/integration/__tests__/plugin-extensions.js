describe("uses 'extensions' from languages to determine parser", () => {
  runPrettier("plugins/extensions", ["*.foo", "--plugin=./plugin.cjs"], {
    ignoreLineEndings: true,
  }).test({
    stdout: "!contents",
    stderr: "",
    status: 0,
    write: [],
  });
});
