const esmFiles = {
  prettier: "prettier/standalone.mjs",
  plugins: [
    "prettier/plugins/angular.mjs",
    "prettier/plugins/graphql.mjs",
    "prettier/plugins/typescript.mjs",
    "prettier/plugins/estree.mjs",
    "prettier/plugins/markdown.mjs",
    "prettier/plugins/acorn.mjs",
    "prettier/plugins/glimmer.mjs",
    "prettier/plugins/postcss.mjs",
    "prettier/plugins/babel.mjs",
    "prettier/plugins/html.mjs",
    "prettier/plugins/yaml.mjs",
    "prettier/plugins/flow.mjs",
    "prettier/plugins/meriyah.mjs",
    "plugin-hermes/index.mjs",
    "plugin-oxc/index.browser.mjs",
  ],
};

async function getPrettier() {
  const [prettier, ...builtinPlugins] = await Promise.all(
    [esmFiles.prettier, ...esmFiles.plugins].map((file) => import(`/${file}`)),
  );

  const addBuiltinPlugins = (options = {}) => ({
    ...options,
    plugins: [...builtinPlugins, ...(options.plugins || [])],
  });

  return { prettier, addBuiltinPlugins };
}

globalThis.__prettier = {
  async formatWithCursor(input, options) {
    const { prettier, addBuiltinPlugins } = await getPrettier();

    return prettier.formatWithCursor(input, addBuiltinPlugins(options));
  },
  async getSupportInfo(options) {
    const { prettier, addBuiltinPlugins } = await getPrettier();
    return prettier.getSupportInfo(addBuiltinPlugins(options));
  },
  __debug: {
    async parse(input, options, devOptions) {
      const { prettier, addBuiltinPlugins } = await getPrettier();
      return prettier.__debug.parse(
        input,
        addBuiltinPlugins(options),
        devOptions,
      );
    },
  },
};
