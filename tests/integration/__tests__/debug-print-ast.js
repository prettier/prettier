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

async function getAst({ code, parser, getResult }) {
  const { stdout } = await runCli(
    "cli/with-shebang",
    ["--debug-print-ast", "--parser", parser],
    {
      input: code,
    },
  );

  return {
    code,
    result: getResult(
      JSON.parse(stdout, (key, value) =>
        key === "loc" || key === "start" || key === "end" || key === "range"
          ? undefined
          : value,
      ),
    ),
  };
}

test("prints BigInt literals with --debug-print-ast", async () => {
  expect(
    await getAst({
      code: "1n",
      parser: "babel",
      getResult: (ast) => ast.program.body[0].expression,
    }),
  ).toMatchSnapshot();
});
test("prints RegExp literals with --debug-print-ast", async () => {
  expect(
    await getAst({
      code: "/a/ig",
      parser: "acorn",
      getResult: (ast) => ast.body[0].expression,
    }),
  ).toMatchSnapshot();
});
