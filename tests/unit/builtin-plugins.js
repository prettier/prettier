import loadBuiltinPlugins from "../../src/main/plugins/load-builtin-plugins.js";

// Snapshot to prevent mistakes
test("builtin parsers", async () => {
  const parserNames = (await loadBuiltinPlugins())
    .flatMap((plugin) => (plugin.parsers ? Object.keys(plugin.parsers) : []))
    .sort();

  expect(parserNames).toMatchInlineSnapshot(`
    [
      "__babel_estree",
      "__js_expression",
      "__ng_action",
      "__ng_binding",
      "__ng_directive",
      "__ng_interpolation",
      "__ts_expression",
      "__vue_event_binding",
      "__vue_expression",
      "__vue_ts_event_binding",
      "__vue_ts_expression",
      "acorn",
      "angular",
      "babel",
      "babel-flow",
      "babel-ts",
      "css",
      "espree",
      "flow",
      "glimmer",
      "graphql",
      "html",
      "json",
      "json-stringify",
      "json5",
      "jsonc",
      "less",
      "lwc",
      "markdown",
      "mdx",
      "meriyah",
      "mjml",
      "remark",
      "scss",
      "typescript",
      "vue",
      "yaml",
    ]
  `);
});
