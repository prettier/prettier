describe("prints information for debugging AST --debug-print-ast", () => {
  runCli("cli/with-shebang", ["--debug-print-ast", "--parser", "babel"], {
    input: "const foo = 'foo';",
  }).test({
    stderr: "",
    status: 0,
  });
});
