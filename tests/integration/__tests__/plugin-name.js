import url from "node:url";
import prettier from "../../config/prettier-entry.js";

const getOptions = async ({ name, plugin }) => {
  const { ast: options } = await prettier.__debug.parse("_", {
    plugins: [plugin],
    parser: name,
  });
  return options;
};

test("Plugins in options", async () => {
  const pluginName = "get-parse-options";
  const pluginUrl = new URL(
    "../plugins/get-parse-options/plugin.js",
    import.meta.url,
  );
  const pluginPath = url.fileURLToPath(pluginUrl);
  const pluginImplementation = await import(pluginUrl);

  for (const { plugin, expected } of [
    { plugin: pluginUrl, expected: pluginPath },
    { plugin: pluginUrl.href, expected: pluginPath },
    { plugin: pluginPath, expected: pluginPath },
    { plugin: pluginImplementation, expected: undefined },
  ]) {
    const options = await getOptions({ name: pluginName, plugin });
    const { name } = options.plugins.find(
      (plugin) => plugin.__plugin_internal_name === pluginName,
    );
    expect(name).toBe(expected);
  }
});
