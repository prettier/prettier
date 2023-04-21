describe("prints doc with --debug-print-doc", () => {
  runCli("cli/with-shebang", ["--debug-print-doc", "--parser", "babel"], {
    input: "0",
  }).test({
    stdout: '["0", ";", hardline]',
    stderr: "",
    status: 0,
    write: [],
  });
});
