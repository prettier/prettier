describe("preserves shebang", () => {
  runCli("cli/with-shebang", ["--end-of-line", "lf", "issue1890.js"]).test({
    status: 0,
  });
});
