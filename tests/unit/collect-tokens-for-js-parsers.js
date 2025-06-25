import loadBuiltinPlugins from "../../src/main/plugins/load-builtin-plugins.js";

// https://github.com/hosseinmd//issues/245
test("Collect tokens for prettier-plugin-jsdoc", async () => {
  const [{ parsers }] = await loadBuiltinPlugins();

  for (const [name, getParser] of Object.entries(parsers)) {
    if (name.startsWith("__ng") || name.startsWith("json")) {
      continue;
    }

    const parser = await getParser();
    if (parser.astFormat !== "estree") {
      continue;
    }

    const ast = await parser.parse("1", { __collect_tokens: true });

    expect(Array.isArray(ast.tokens) && ast.tokens.length > 0).toBe(true);
  }
});
