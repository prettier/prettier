const plugins = await Promise.all(
  [
    "../../../config/prettier-plugins/prettier-plugin-uppercase-rocks/index.js",
  ].map(async (plugin) => (await import(plugin)).default),
);

run_spec(import.meta, ["vue"], { plugins });
run_spec(import.meta, ["vue"], { plugins, embeddedLanguageFormatting: "off" });
