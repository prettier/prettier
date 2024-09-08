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
  expect(data).toHaveProperty("loc", {
    start: {
      line: 1,
      column: 0,
      index: 0,
    },
    end: {
      line: 1,
      column: 18,
      index: 18,
    },
  });
});
