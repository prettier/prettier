describe("Line breaking after filepath with errors", () => {
  runCli("cli/syntax-errors", ["--list-different", "*.js"]).test({ status: 2 });
  runCli("cli/syntax-errors", ["--check", "*.js"]).test({ status: 2 });
  runCli("cli/syntax-errors", ["--write", "*.js"]).test({ status: 2 });
});
