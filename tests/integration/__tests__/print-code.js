describe("Line breaking after filepath with errors", () => {
  runCli("cli/print-code", ["./ignored.js"], {
    stdoutIsTTY: true,
  }).test({
    status: 0,
    write: [],
    stderr: "[warn] Ignored ignored.js because it matches an ignore pattern.",
  });
  runCli("cli/print-code", ["./not-ignored.js"], {
    stdoutIsTTY: true,
  }).test({ status: 0, write: [], stderr: "" });
});
