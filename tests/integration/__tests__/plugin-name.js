import path from "node:path";
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
  const name = "get-parse-options";

  const pluginUrl = new URL(
    "../plugins/get-parse-options/plugin.js",
    import.meta.url,
  );
  const pluginPath = url.fileURLToPath(pluginUrl);

  for (const { plugin, expected } of [
    { plugin: pluginUrl, expected: pluginUrl.href },
    { plugin: pluginUrl.href, expected: pluginUrl.href },
    { plugin: pluginPath, expected: pluginPath },
  ]) {
    const options = await getOptions({ name, plugin });
    const pluginInOptions = options.plugins.find(
      (plugin) => plugin.__plugin_internal_name === name,
    );
    expect(typeof pluginInOptions.name).toBe("string");
    expect(pluginInOptions.name).toBe(expected);
  }
});
