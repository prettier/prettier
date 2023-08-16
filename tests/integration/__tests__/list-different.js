describe("checks stdin with --list-different", () => {
  runCli("cli/with-shebang", ["--list-different", "--parser", "babel"], {
    input: "0",
  }).test({
    stdout: "(stdin)",
    stderr: "",
    status: "non-zero",
  });
});

describe("checks stdin with -l (alias for --list-different)", () => {
  runCli("cli/with-shebang", ["-l", "--parser", "babel"], {
    input: "0",
  }).test({
    stdout: "(stdin)",
    stderr: "",
    status: "non-zero",
  });
});

describe("--list-different works in CI just as in a non-TTY mode", () => {
  const result0 = runCli(
    "cli/write",
    ["--list-different", "formatted.js", "unformatted.js"],
    {
      stdoutIsTTY: true,
      ci: true,
    },
  ).test({
    status: 1,
  });

  const result1 = runCli(
    "cli/write",
    ["--list-different", "formatted.js", "unformatted.js"],
    {
      stdoutIsTTY: false,
    },
  ).test({
    status: 1,
  });

  test("Should be the same", async () => {
    expect(await result0.stdout).toEqual(await result1.stdout);
  });
});
