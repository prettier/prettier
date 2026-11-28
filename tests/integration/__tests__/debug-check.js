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

describe("compares AST values independently of property insertion order", () => {
  runCli(
    "cli/debug-check",
    [
      "--debug-check",
      "--parser",
      "property-order",
      "--plugin",
      "./plugin-property-order.cjs",
    ],
    { input: "formatted" },
  ).test({
    stdout: "(stdin)",
    stderr: "",
    status: 0,
  });
});

test("still reports AST value changes", async () => {
  const result = await runCli(
    "cli/debug-check",
    [
      "--debug-check",
      "--parser",
      "different-value",
      "--plugin",
      "./plugin-property-order.cjs",
    ],
    { input: "formatted" },
  );
  expect(result.status).toBe(2);
  expect(result.stderr).toContain("ast(input) !== ast(prettier(input))");
  expect(result.stderr).toContain('-  "value": 1');
  expect(result.stderr).toContain('+  "value": 2');
});
