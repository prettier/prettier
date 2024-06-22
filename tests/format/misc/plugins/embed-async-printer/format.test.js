const plugins = await Promise.all(
  [
    "../../../../config/prettier-plugins/prettier-plugin-async-printer/index.cjs",
    "../../../../config/prettier-plugins/prettier-plugin-uppercase-rocks/index.js",
  ].map(async (plugin) => (await import(plugin)).default),
);

runFormatTest(import.meta, ["markdown"], { plugins });
