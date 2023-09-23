describe("doesn't crash when --debug-check is passed", () => {
  runCli("cli/with-shebang", ["issue1890.js", "--debug-check"]).test({
    stdout: "issue1890.js",
    stderr: "",
    status: 0,
  });
});

describe("checks stdin with --debug-check", () => {
  runCli("cli/with-shebang", ["--debug-check", "--parser", "babel"], {
    input: "0",
  }).test({
    stdout: "(stdin)",
    stderr: "",
    status: 0,
  });
});

describe("show diff for 2+ error files with --debug-check", () => {
  runCli("cli/debug-check", [
    "--end-of-line",
    "lf",
    "*.debug-check",
    "--debug-check",
    "--plugin",
    "./plugin-for-testing-debug-check.cjs",
  ]).test({
    status: "non-zero",
  });
});

describe("should not exit non-zero for already prettified code with --debug-check + --check", () => {
  runCli("cli/debug-check", ["issue-4599.js", "--debug-check", "--check"]).test(
    {
      status: 0,
    },
  );
});

describe("should not exit non-zero for already prettified code with --debug-check + --list-different", () => {
  runCli("cli/debug-check", [
    "issue-4599.js",
    "--debug-check",
    "--list-different",
  ]).test({
    status: 0,
  });
});

describe("should not exit non-zero for jsx style element with spread attribute", () => {
  runCli("cli/debug-check", ["issue-15094.jsx", "--debug-check"]).test({
    status: 0,
  });
});
