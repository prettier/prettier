describe("checks stdin with --check", () => {
  runCli("cli/with-shebang", ["--check", "--parser", "babel"], {
    input: "0",
  }).test({
    stdout: "(stdin)",
    stderr: "",
    status: "non-zero",
  });
});

describe("checks stdin with -c (alias for --check)", () => {
  runCli("cli/with-shebang", ["-c", "--parser", "babel"], {
    input: "0",
  }).test({
    stdout: "(stdin)",
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
    expect(await result0.stdout).toEqual(await result1.stdout);
  });
});

describe("--checks should print the number of files that need formatting", () => {
  runCli("cli/write", ["--check", "unformatted.js", "unformatted2.js"], {
    input: "0",
  }).test({
    status: 1,
  });
});
