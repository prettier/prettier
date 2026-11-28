describe("checks stdin with --check", () => {
  runCli("cli/with-shebang", ["--check", "--parser", "babel"], {
    input: "0",
  }).test({
    stdout: String.raw`(stdin)
Index: (stdin)
===================================================================
--- (stdin)
+++ (stdin)
@@ -1,1 +1,1 @@
-0
\ No newline at end of file
+0;`,
    stderr: "",
    status: "non-zero",
  });
});

describe("checks stdin with -c (alias for --check)", () => {
  runCli("cli/with-shebang", ["-c", "--parser", "babel"], {
    input: "0",
  }).test({
    stdout: String.raw`(stdin)
Index: (stdin)
===================================================================
--- (stdin)
+++ (stdin)
@@ -1,1 +1,1 @@
-0
\ No newline at end of file
+0;`,
    stderr: "",
    status: "non-zero",
  });
});

describe("--checks works in CI just as in a non-TTY mode", () => {
  const result0 = runCli(
    "cli/write",
    ["--check", "formatted.js", "unformatted.js"],
    {
      stdoutIsTTY: true,
      ci: true,
    },
  ).test({
    status: 1,
  });

  const result1 = runCli(
    "cli/write",
    ["--check", "formatted.js", "unformatted.js"],
    {
      stdoutIsTTY: false,
    },
  ).test({
    status: 1,
  });

  test("Should have same stdout", async () => {
    expect(await result0.stdout).toBe(await result1.stdout);
  });
});

describe("--checks should print the number of files that need formatting", () => {
  runCli("cli/write", ["--check", "unformatted.js", "unformatted2.js"], {
    input: "0",
  }).test({
    status: 1,
  });
});

describe("--check prints a unified diff of unformatted files", () => {
  runCli("cli/write", ["--check", "unformatted.js"]).test({
    status: 1,
    stdout: "Checking formatting...",
    stderr: String.raw`[warn] unformatted.js
Index: unformatted.js
===================================================================
--- unformatted.js
+++ unformatted.js
@@ -1,1 +1,1 @@
-var x      =      1;
\ No newline at end of file
+var x = 1;
[warn] Code style issues found in the above file. Run Prettier with --write to fix.`,
  });
});

describe("--check with --write does not print a diff", () => {
  runCli("cli/write", ["--check", "--write", "unformatted.js"]).test({
    status: 0,
    stdout: "Checking formatting...",
    stderr:
      "[warn] unformatted.js\n[warn] Code style issues fixed in the above file.",
    write: [{ content: "var x = 1;\n", filename: "unformatted.js" }],
  });
});

describe("--check with --log-level silent prints nothing", () => {
  runCli("cli/write", [
    "--check",
    "--log-level",
    "silent",
    "unformatted.js",
  ]).test({
    status: 1,
    stdout: "",
    stderr: "",
  });
});
