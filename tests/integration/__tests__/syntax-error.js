describe("exits with non-zero code when input has a syntax error", () => {
  runCli("cli/with-shebang", ["--parser", "babel"], {
    input: "a.2",
  }).test({
    status: 2,
  });
});
