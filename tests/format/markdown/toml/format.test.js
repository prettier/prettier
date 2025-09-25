const plugins = await Promise.all(
  ["../../../config/prettier-plugins/prettier-plugin-toml/index.js"].map(
    async (plugin) => (await import(plugin)).default,
  ),
);

runFormatTest(import.meta, ["markdown"], {
  proseWrap: "always",
  plugins,
});
