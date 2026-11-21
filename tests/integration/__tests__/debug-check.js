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
    write: [],
  });
});

describe("checks BigInt literals with --debug-check", () => {
  runCli("cli/with-shebang", ["--debug-check", "--parser", "babel"], {
    input: "1n",
  }).test({
    stdout: "(stdin)",
    stderr: "",
    status: 0,
  });
});

const astComparisonArgs = [
  "--debug-check",
  "--parser",
  "debug-check-ast-comparison",
  "--plugin",
  "./plugin-for-testing-ast-comparison.cjs",
];

describe("accepts reordered AST properties with --debug-check", () => {
  runCli("cli/debug-check", astComparisonArgs, { input: " text " }).test({
    status: 0,
    stdout: "(stdin)",
    stderr: "",
    write: [],
  });
});

describe("reports changed AST values with --debug-check", () => {
  runCli("cli/debug-check", astComparisonArgs, { input: "text extra" }).test({
    status: 2,
    stdout: "",
    stderr(output) {
      expect(output).toContain("stdin: ast(input) !== ast(prettier(input))");
      expect(output).toContain("text extra");
    },
    write: [],
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
