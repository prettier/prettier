test("prints information for debugging AST --debug-print-locless-ast", async () => {
  const { stdout } = await runCli(
    "cli/with-shebang",
    ["--debug-print-locless-ast", "--parser", "babel"],
    {
      input: "const foo = 'foo';",
    },
  );

  const data = JSON.parse(stdout);

  expect(data).toHaveProperty("type", "File");
  expect(data).toHaveProperty("program.type", "Program");
  expect(data).not.toHaveProperty("loc");
});
