test("prints information for debugging AST --debug-print-ast", async () => {
  const { stdout } = await runCli(
    "cli/with-shebang",
    ["--debug-print-ast", "--parser", "babel"],
    {
      input: "const foo = 'foo';",
    },
  );

  const data = JSON.parse(stdout);

  expect(data).toHaveProperty("type", "File");
  expect(data).toHaveProperty("program.type", "Program");
});

test("prints BigInt literals with --debug-print-ast", async () => {
  const { stdout, stderr } = await runCli(
    "cli/with-shebang",
    ["--debug-print-ast", "--parser", "babel"],
    {
      input: "const foo = 10n;",
    },
  );

  expect(stderr).toBe("");
  const data = JSON.parse(stdout);
  expect(data).toHaveProperty(
    "program.body.0.declarations.0.init.value",
    "10n",
  );
});
