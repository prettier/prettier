import loadBuiltinPlugins from "../../src/common/load-builtin-plugins.js";

test("builtin parsers", async () => {
  const parserNamesFromConfigFiles = [];

  for (const parsersConfigFile of [
    "../../src/language-css/parsers-config.js",
    "../../src/language-graphql/parsers-config.js",
    "../../src/language-handlebars/parsers-config.js",
    "../../src/language-html/parsers-config.js",
    "../../src/language-markdown/parsers-config.js",
    "../../src/language-yaml/parsers-config.js",
    "../../src/plugins/acorn-parsers-config.js",
    "../../src/plugins/angular-parsers-config.js",
    "../../src/plugins/babel-parsers-config.js",
    "../../src/plugins/flow-parsers-config.js",
    "../../src/plugins/meriyah-parsers-config.js",
    "../../src/plugins/typescript-parsers-config.js",
  ]) {
    const { default: parserConfigs } = await import(parsersConfigFile);

    for (const { importParsers, parserNames } of parserConfigs) {
      const parsers = await importParsers();
      expect(Object.keys(parsers).sort()).toEqual(parserNames.sort());
      parserNamesFromConfigFiles.push(...parserNames);
    }
  }

  parserNamesFromConfigFiles.sort();
  const parserNames = (await loadBuiltinPlugins())
    .flatMap((plugin) => (plugin.parsers ? Object.keys(plugin.parsers) : []))
    .sort();

  expect(parserNamesFromConfigFiles).toEqual(parserNames);

  expect(parserNames).toMatchInlineSnapshot(`
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
