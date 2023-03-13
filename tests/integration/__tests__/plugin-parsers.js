test("parsers", async () => {
  for (const parsersConfigModule of [
    "../../../src/language-css/parsers.js",
    "../../../src/language-graphql/parsers.js",
    "../../../src/language-handlebars/parsers.js",
    "../../../src/language-html/parsers.js",
    "../../../src/language-js/parse/parsers.js",
    "../../../src/language-markdown/parsers.js",
    "../../../src/language-yaml/parsers.js",
  ]) {
    const { default: parserConfigs } = await import(parsersConfigModule);

    for (const { importPlugin, parserNames } of parserConfigs) {
      const plugins = await importPlugin();
      expect(Object.keys(plugins.parsers).sort()).toEqual(parserNames.sort());
    }
  }
});
