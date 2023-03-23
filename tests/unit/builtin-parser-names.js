import builtinPlugins from "../../src/plugins/all.js";

test("builtin parser names", () => {
  expect(
    builtinPlugins
      .flatMap((plugin) => (plugin.parsers ? Object.keys(plugin.parsers) : []))
      .sort()
  ).toMatchInlineSnapshot(`
    [
      "__babel_estree",
      "__js_expression",
      "__ng_action",
      "__ng_binding",
      "__ng_directive",
      "__ng_interpolation",
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
      "less",
      "lwc",
      "markdown",
      "mdx",
      "meriyah",
      "remark",
      "scss",
      "typescript",
      "vue",
      "yaml",
    ]
  `);
});
