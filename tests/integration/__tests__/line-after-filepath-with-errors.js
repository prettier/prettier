describe("Line breaking after filepath with errors", () => {
  runCli("cli/syntax-errors", ["--list-different", "*.js"], {
    stdoutIsTTY: true,
  }).test({ status: 2 });
  runCli("cli/syntax-errors", ["--check", "*.js"], {
    stdoutIsTTY: true,
  }).test({ status: 2 });
  runCli("cli/syntax-errors", ["--write", "*.js"], {
    stdoutIsTTY: true,
  }).test({ status: 2 });
});
